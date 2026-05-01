import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { tags, postTags } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export default async function tagsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async () => {
    const items = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        postCount: sql<number>`(SELECT count(*) FROM post_tags WHERE tag_id = ${tags.id})`,
      })
      .from(tags)
      .all();

    return { success: true, data: items };
  });

  app.post<{
    Body: { name: string; slug: string };
  }>("/", async (request) => {
    const result = await db.insert(tags).values(request.body).returning().get();
    return { success: true, data: result };
  });

  app.put<{
    Params: { id: string };
    Body: { name?: string; slug?: string };
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(tags).where(eq(tags.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Tag not found" });
    }
    const result = await db
      .update(tags)
      .set(request.body)
      .where(eq(tags.id, id))
      .returning()
      .get();
    return { success: true, data: result };
  });

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(tags).where(eq(tags.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Tag not found" });
    }
    await db.delete(tags).where(eq(tags.id, id)).run();
    return { success: true };
  });
}
