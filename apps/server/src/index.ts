import { buildApp } from "./app.js";
import { initDatabase, db } from "./db/index.js";
import { posts } from "./db/schema.js";
import { eq, lte, and, sql } from "drizzle-orm";

const PORT = Number(process.env.PORT) || 3000;

await initDatabase();

const app = await buildApp();

// Scheduled post publisher - check every 60 seconds
setInterval(async () => {
  try {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const scheduled = await db
      .select()
      .from(posts)
      .where(and(
        eq(posts.status, "scheduled"),
        lte(posts.scheduledAt, now),
      ))
      .all();

    for (const post of scheduled) {
      await db.update(posts).set({
        status: "published",
        publishedAt: post.scheduledAt,
      }).where(and(eq(posts.id, post.id), eq(posts.status, "scheduled"))).run();
      console.log(`[scheduler] Published scheduled post: ${post.title}`);
    }
  } catch (err) {
    console.error("[scheduler] Error:", err);
  }
}, 60_000);

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
