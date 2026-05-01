import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { categories, posts } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export default async function categoriesRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async () => {
    const items = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        postCount: sql<number>`(SELECT count(*) FROM posts WHERE category_id = ${categories.id})`,
      })
      .from(categories)
      .all();

    return { success: true, data: items };
  });

  app.post<{
    Body: { name: string; slug: string; description?: string };
  }>("/", async (request) => {
    const result = await db
      .insert(categories)
      .values(request.body)
      .returning()
      .get();
    return { success: true, data: result };
  });

  app.put<{
    Params: { id: string };
    Body: { name?: string; slug?: string; description?: string };
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(categories).where(eq(categories.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Category not found" });
    }
    const result = await db
      .update(categories)
      .set(request.body)
      .where(eq(categories.id, id))
      .returning()
      .get();
    return { success: true, data: result };
  });

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(categories).where(eq(categories.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Category not found" });
    }
    await db.delete(categories).where(eq(categories.id, id)).run();
    return { success: true };
  });
}
