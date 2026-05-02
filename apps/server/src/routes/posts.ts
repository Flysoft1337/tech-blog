import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { posts, postTags, categories, tags, users } from "../db/schema.js";
import { eq, sql, desc, and, like, or } from "drizzle-orm";
import { renderMarkdown } from "../services/markdown.js";

export default async function postsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  // List posts (admin)
  app.get<{
    Querystring: { page?: string; pageSize?: string; status?: string; q?: string };
  }>("/", async (request) => {
    const page = Number(request.query.page) || 1;
    const pageSize = Number(request.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (request.query.status) {
      conditions.push(eq(posts.status, request.query.status as "draft" | "published"));
    }
    if (request.query.q) {
      const search = `%${request.query.q}%`;
      conditions.push(
        or(like(posts.title, search), like(posts.content, search))!
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        content: posts.content,
        contentHtml: posts.contentHtml,
        status: posts.status,
        pinned: posts.pinned,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        categoryName: categories.name,
        authorName: users.displayName,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(users, eq(posts.authorId, users.id))
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
      seriesId?: number;
      seriesOrder?: number;
      scheduledAt?: string;
    };
  }>("/", {
    schema: {
      body: {
        type: "object",
        required: ["title", "slug", "content"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          slug: { type: "string", minLength: 1, maxLength: 200 },
          content: { type: "string", minLength: 1 },
          excerpt: { type: "string", maxLength: 500 },
          coverImage: { type: "string", maxLength: 500 },
          status: { type: "string", enum: ["draft", "published", "scheduled"] },
          pinned: { type: "boolean" },
          categoryId: { type: "integer" },
          tagIds: { type: "array", items: { type: "integer" } },
          seriesId: { type: "integer" },
          seriesOrder: { type: "integer" },
          scheduledAt: { type: "string" },
        },
      },
    },
  }, async (request) => {
    const { tagIds, ...data } = request.body;
    const contentHtml = await renderMarkdown(data.content);

    if (data.scheduledAt) {
      data.scheduledAt = data.scheduledAt.replace("T", " ").substring(0, 16).padEnd(19, ":00");
    }

    const result = await db
      .insert(posts)
      .values({
        ...data,
        contentHtml,
        status: (data.status as "draft" | "published" | "scheduled") || "draft",
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
      seriesId?: number;
      seriesOrder?: number;
      scheduledAt?: string;
    };
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const { tagIds, ...data } = request.body;

    const existing = await db.select().from(posts).where(eq(posts.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Post not found" });
    }

    if (data.scheduledAt) {
      data.scheduledAt = data.scheduledAt.replace("T", " ").substring(0, 16).padEnd(19, ":00");
    }

    // Filter out undefined values to avoid overwriting existing data
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) updateData[key] = value;
    }
    if (data.content) {
      updateData.contentHtml = await renderMarkdown(data.content);
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

  // Preview markdown
  app.post<{ Body: { content: string } }>("/preview", async (request) => {
    const html = await renderMarkdown(request.body.content || "");
    return { success: true, data: { html } };
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

  // Export all posts as JSON
  app.get("/export", async () => {
    const allPosts = await db.select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      content: posts.content,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      status: posts.status,
      pinned: posts.pinned,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    }).from(posts).orderBy(desc(posts.createdAt)).all();

    return { success: true, data: allPosts };
  });

  // Analytics/stats
  app.get("/stats", async () => {
    const topViewed = await db.select({
      id: posts.id, title: posts.title, slug: posts.slug, viewCount: posts.viewCount,
    }).from(posts).where(eq(posts.status, "published"))
      .orderBy(desc(posts.viewCount)).limit(10).all();

    const [{ totalViews }] = await db.select({
      totalViews: sql<number>`COALESCE(SUM(view_count), 0)`,
    }).from(posts).all();

    const recentComments = await db.select({
      count: sql<number>`count(*)`,
    }).from(comments).where(
      sql`created_at >= datetime('now', '-7 days')`
    ).all();

    const postsByMonth = await db.select({
      month: sql<string>`strftime('%Y-%m', published_at)`,
      count: sql<number>`count(*)`,
    }).from(posts).where(eq(posts.status, "published"))
      .groupBy(sql`strftime('%Y-%m', published_at)`)
      .orderBy(desc(sql`strftime('%Y-%m', published_at)`))
      .limit(12).all();

    return {
      success: true,
      data: {
        topViewed,
        totalViews,
        recentComments: recentComments[0]?.count || 0,
        postsByMonth,
      },
    };
  });
}
