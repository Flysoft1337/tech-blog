import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { posts, postTags, categories, tags, users } from "../db/schema.js";
import { eq, sql, desc, and } from "drizzle-orm";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export default async function postsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  // List posts (admin)
  app.get<{
    Querystring: { page?: string; pageSize?: string; status?: string };
  }>("/", async (request) => {
    const page = Number(request.query.page) || 1;
    const pageSize = Number(request.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (request.query.status) {
      conditions.push(eq(posts.status, request.query.status as "draft" | "published"));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(posts)
      .where(where)
      .orderBy(desc(posts.createdAt))
      .limit(pageSize)
      .offset(offset)
      .all();

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(where)
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

  // Get single post
  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, Number(request.params.id)))
      .get();

    if (!post) {
      return reply.status(404).send({ success: false, error: "Post not found" });
    }

    const postTagRows = await db
      .select({ tagId: postTags.tagId })
      .from(postTags)
      .where(eq(postTags.postId, post.id))
      .all();

    const tagList =
      postTagRows.length > 0
        ? await db
            .select()
            .from(tags)
            .where(
              sql`${tags.id} IN (${sql.join(
                postTagRows.map((r) => sql`${r.tagId}`),
                sql`, `
              )})`
            )
            .all()
        : [];

    return { success: true, data: { ...post, tags: tagList } };
  });

  // Create post
  app.post<{
    Body: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      coverImage?: string;
      status?: string;
      pinned?: boolean;
      categoryId?: number;
      tagIds?: number[];
    };
  }>("/", async (request) => {
    const { tagIds, ...data } = request.body;
    const contentHtml = sanitizeHtml(await marked(data.content));

    const result = await db
      .insert(posts)
      .values({
        ...data,
        contentHtml,
        status: (data.status as "draft" | "published") || "draft",
        pinned: data.pinned || false,
        authorId: request.user.id,
        publishedAt:
          data.status === "published"
            ? new Date().toISOString()
            : undefined,
      })
      .returning()
      .get();

    if (tagIds?.length) {
      for (const tagId of tagIds) {
        await db.insert(postTags).values({ postId: result.id, tagId }).run();
      }
    }

    return { success: true, data: result };
  });

  // Update post
  app.put<{
    Params: { id: string };
    Body: {
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      coverImage?: string;
      status?: string;
      pinned?: boolean;
      categoryId?: number;
      tagIds?: number[];
    };
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const { tagIds, ...data } = request.body;

    const existing = await db.select().from(posts).where(eq(posts.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Post not found" });
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.content) {
      updateData.contentHtml = sanitizeHtml(await marked(data.content));
    }
    if (data.status === "published" && !existing.publishedAt) {
      updateData.publishedAt = new Date().toISOString();
    }

    const result = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning()
      .get();

    if (tagIds !== undefined) {
      await db.delete(postTags).where(eq(postTags.postId, id)).run();
      for (const tagId of tagIds) {
        await db.insert(postTags).values({ postId: id, tagId }).run();
      }
    }

    return { success: true, data: result };
  });

  // Delete post
  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(posts).where(eq(posts.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Post not found" });
    }
    await db.delete(posts).where(eq(posts.id, id)).run();
    return { success: true };
  });
}
