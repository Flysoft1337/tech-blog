import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import authPlugin from "./plugins/auth.js";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import categoriesRoutes from "./routes/categories.js";
import tagsRoutes from "./routes/tags.js";
import commentsRoutes from "./routes/comments.js";
import mediaRoutes from "./routes/media.js";
import settingsRoutes from "./routes/settings.js";
import usersRoutes from "./routes/users.js";
import publicRoutes from "./routes/public.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(authPlugin);

  app.get("/", async () => ({
    name: "tech-blog-api",
    version: "0.0.1",
    status: "ok",
  }));

  // API routes
  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(publicRoutes, { prefix: "/api/v1" });
  await app.register(postsRoutes, { prefix: "/api/v1/admin/posts" });
  await app.register(categoriesRoutes, { prefix: "/api/v1/admin/categories" });
  await app.register(tagsRoutes, { prefix: "/api/v1/admin/tags" });
  await app.register(commentsRoutes, { prefix: "/api/v1/admin/comments" });
  await app.register(mediaRoutes, { prefix: "/api/v1/admin/media" });
  await app.register(settingsRoutes, { prefix: "/api/v1/admin/settings" });
  await app.register(usersRoutes, { prefix: "/api/v1/admin/users" });

  // Serve uploaded files
  const uploadDir = resolve(process.env.UPLOAD_DIR || "./data/uploads");
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  await app.register(fastifyStatic, {
    root: uploadDir,
    prefix: "/uploads/",
  });

  return app;
}
