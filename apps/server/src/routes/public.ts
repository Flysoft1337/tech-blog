import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import {
  posts,
  categories,
  tags,
  postTags,
  comments,
  users,
  settings,
} from "../db/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";

export default async function publicRoutes(app: FastifyInstance) {
  // Public posts list
  app.get<{
    Querystring: { page?: string; pageSize?: string; category?: string; tag?: string };
  }>("/posts", async (request) => {
    const settingsRows = await db.select().from(settings).all();
    const config: Record<string, string> = {};
    for (const row of settingsRows) config[row.key] = row.value;

    const page = Number(request.query.page) || 1;
    const pageSize =
      Number(request.query.pageSize) || Number(config.postsPerPage) || 10;
    const offset = (page - 1) * pageSize;

    let query = db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        status: posts.status,
        pinned: posts.pinned,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
        authorName: users.displayName,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.pinned), desc(posts.publishedAt))
      .limit(pageSize)
      .offset(offset);

    const items = await query.all();

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.status, "published"))
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

  // Public post by slug
  app.get<{ Params: { slug: string } }>("/posts/:slug", async (request, reply) => {
    const post = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, request.params.slug), eq(posts.status, "published")))
      .get();

    if (!post) {
      return reply.status(404).send({ success: false, error: "Post not found" });
    }

    const author = await db
      .select({ displayName: users.displayName })
      .from(users)
      .where(eq(users.id, post.authorId))
      .get();

    const category = post.categoryId
      ? await db
          .select({ id: categories.id, name: categories.name, slug: categories.slug })
          .from(categories)
          .where(eq(categories.id, post.categoryId))
          .get()
      : undefined;

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

    return {
      success: true,
      data: {
        ...post,
        author: author ? { displayName: author.displayName } : undefined,
        category,
        tags: tagList,
      },
    };
  });

  // Public categories
  app.get("/categories", async () => {
    const items = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        postCount:
          sql<number>`(SELECT count(*) FROM posts WHERE category_id = ${categories.id} AND status = 'published')`,
      })
      .from(categories)
      .all();

    return { success: true, data: items };
  });

  // Public tags
  app.get("/tags", async () => {
    const items = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        postCount:
          sql<number>`(SELECT count(*) FROM post_tags pt JOIN posts p ON pt.post_id = p.id WHERE pt.tag_id = ${tags.id} AND p.status = 'published')`,
      })
      .from(tags)
      .all();

    return { success: true, data: items };
  });

  // Get comments for a post (approved only)
  app.get<{ Params: { slug: string } }>(
    "/posts/:slug/comments",
    async (request, reply) => {
      const post = await db
        .select({ id: posts.id })
        .from(posts)
        .where(
          and(eq(posts.slug, request.params.slug), eq(posts.status, "published"))
        )
        .get();

      if (!post) {
        return reply
          .status(404)
          .send({ success: false, error: "Post not found" });
      }

      const items = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.postId, post.id),
            eq(comments.status, "approved")
          )
        )
        .orderBy(comments.createdAt)
        .all();

      return { success: true, data: items };
    }
  );

  // Submit a comment (public)
  app.post<{
    Params: { slug: string };
    Body: {
      authorName: string;
      authorEmail: string;
      authorUrl?: string;
      content: string;
      parentId?: number;
    };
  }>("/posts/:slug/comments", async (request, reply) => {
    const post = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        and(eq(posts.slug, request.params.slug), eq(posts.status, "published"))
      )
      .get();

    if (!post) {
      return reply
        .status(404)
        .send({ success: false, error: "Post not found" });
    }

    const cleanContent = sanitizeHtml(request.body.content, {
      allowedTags: [],
      allowedAttributes: {},
    });

    const result = await db
      .insert(comments)
      .values({
        postId: post.id,
        parentId: request.body.parentId || null,
        authorName: sanitizeHtml(request.body.authorName, {
          allowedTags: [],
          allowedAttributes: {},
        }),
        authorEmail: request.body.authorEmail,
        authorUrl: request.body.authorUrl || null,
        content: cleanContent,
      })
      .returning()
      .get();

    return { success: true, data: result };
  });

  // Site settings (public, limited)
  app.get("/settings", async () => {
    const rows = await db.select().from(settings).all();
    const data: Record<string, string> = {};
    const publicKeys = ["siteName", "siteDescription", "siteLogo", "siteUrl"];
    for (const row of rows) {
      if (publicKeys.includes(row.key)) {
        data[row.key] = row.value;
      }
    }
    return { success: true, data };
  });
}
