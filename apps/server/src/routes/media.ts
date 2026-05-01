import type { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { db } from "../db/index.js";
import { media } from "../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { resolve, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream/promises";

export default async function mediaRoutes(app: FastifyInstance) {
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  app.addHook("onRequest", app.authenticate);

  const uploadDir = resolve(process.env.UPLOAD_DIR || "./data/uploads");
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

  // List media
  app.get<{
    Querystring: { page?: string; pageSize?: string };
  }>("/", async (request) => {
    const page = Number(request.query.page) || 1;
    const pageSize = Number(request.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const items = await db
      .select()
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(pageSize)
      .offset(offset)
      .all();

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(media)
      .all();

    return {
      success: true,
      data: {
        items,
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  });

  // Upload file
  const ALLOWED_MIME = new Set([
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "video/mp4", "video/webm",
    "application/pdf",
    "text/plain", "text/markdown",
  ]);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  app.post("/upload", async (request, reply) => {
    const file = await request.file();
    if (!file) {
      return reply.status(400).send({ success: false, error: "No file uploaded" });
    }

    if (!ALLOWED_MIME.has(file.mimetype)) {
      return reply.status(400).send({ success: false, error: "File type not allowed" });
    }

    const ext = extname(file.filename).toLowerCase();
    const filename = `${randomUUID()}${ext}`;
    const filepath = resolve(uploadDir, filename);

    await pipeline(file.file, createWriteStream(filepath));

    if (file.file.bytesRead > MAX_FILE_SIZE) {
      unlinkSync(filepath);
      return reply.status(400).send({ success: false, error: "File too large (max 10MB)" });
    }

    const result = await db
      .insert(media)
      .values({
        filename,
        originalName: file.filename,
        mimeType: file.mimetype,
        size: file.file.bytesRead,
        url: `/uploads/${filename}`,
        uploaderId: request.user.id,
      })
      .returning()
      .get();

    return { success: true, data: result };
  });

  // Delete media
  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const item = await db.select().from(media).where(eq(media.id, id)).get();
    if (!item) {
      return reply.status(404).send({ success: false, error: "Media not found" });
    }

    const filepath = resolve(uploadDir, item.filename);
    try {
      unlinkSync(filepath);
    } catch {
      // file may already be deleted
    }

    await db.delete(media).where(eq(media.id, id)).run();
    return { success: true };
  });
}
