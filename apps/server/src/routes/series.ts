import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { series, posts } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export default async function seriesRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async () => {
    const items = await db
      .select({
        id: series.id,
        name: series.name,
        slug: series.slug,
        description: series.description,
        postCount: sql<number>`(SELECT count(*) FROM posts WHERE series_id = ${series.id})`,
        createdAt: series.createdAt,
      })
      .from(series)
      .all();

    return { success: true, data: items };
  });

  app.post<{
    Body: { name: string; slug: string; description?: string };
  }>("/", async (request) => {
    const result = await db
      .insert(series)
      .values({
        name: request.body.name,
        slug: request.body.slug,
        description: request.body.description || null,
      })
      .returning()
      .get();

    return { success: true, data: result };
  });

  app.put<{
    Params: { id: string };
    Body: { name?: string; slug?: string; description?: string };
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(series).where(eq(series.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Series not found" });
    }

    const result = await db
      .update(series)
      .set({
        ...(request.body.name && { name: request.body.name }),
        ...(request.body.slug && { slug: request.body.slug }),
        ...(request.body.description !== undefined && { description: request.body.description }),
      })
      .where(eq(series.id, id))
      .returning()
      .get();

    return { success: true, data: result };
  });

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(series).where(eq(series.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Series not found" });
    }

    await db.update(posts).set({ seriesId: null, seriesOrder: null }).where(eq(posts.seriesId, id)).run();
    await db.delete(series).where(eq(series.id, id)).run();
    return { success: true };
  });
}
