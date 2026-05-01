import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { settings } from "../db/schema.js";
import { eq } from "drizzle-orm";

export default async function settingsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async () => {
    const rows = await db.select().from(settings).all();
    const data: Record<string, string> = {};
    for (const row of rows) {
      data[row.key] = row.value;
    }
    return { success: true, data };
  });

  app.put<{
    Body: Record<string, string>;
  }>("/", async (request) => {
    const entries = Object.entries(request.body);
    for (const [key, value] of entries) {
      await db.insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: settings.key, set: { value } })
        .run();
    }
    return { success: true };
  });
}
