import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { comments, posts } from "../db/schema.js";
import { eq, desc, sql, and, like, or } from "drizzle-orm";

export default async function commentsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get<{
    Querystring: { page?: string; pageSize?: string; status?: string; q?: string };
  }>("/", async (request) => {
    const page = Number(request.query.page) || 1;
    const pageSize = Number(request.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (request.query.status) {
      conditions.push(eq(comments.status, request.query.status as "pending" | "approved" | "spam"));
    }
    if (request.query.q) {
      const q = `%${request.query.q}%`;
      conditions.push(or(
        like(comments.authorName, q),
        like(comments.authorEmail, q),
        like(comments.content, q),
      ));
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select({
        comment: comments,
        postTitle: posts.title,
        postSlug: posts.slug,
      })
      .from(comments)
      .leftJoin(posts, eq(comments.postId, posts.id))
      .where(where)
      .orderBy(desc(comments.createdAt))
      .limit(pageSize)
      .offset(offset)
      .all();

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(where)
      .all();

    return {
      success: true,
      data: {
        items: items.map((row) => ({
          ...row.comment,
          postTitle: row.postTitle,
          postSlug: row.postSlug,
        })),
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  });

  // Update comment status
  app.patch<{
    Params: { id: string };
    Body: { status: "pending" | "approved" | "spam" };
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(comments).where(eq(comments.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Comment not found" });
    }
    const result = await db
      .update(comments)
      .set({ status: request.body.status })
      .where(eq(comments.id, id))
      .returning()
      .get();
    return { success: true, data: result };
  });

  // Delete comment
  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(comments).where(eq(comments.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Comment not found" });
    }
    await db.delete(comments).where(eq(comments.id, id)).run();
    return { success: true };
  });
}
