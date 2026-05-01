import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";

export default async function usersRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async () => {
    const items = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .all();

    return { success: true, data: items };
  });

  app.post<{
    Body: {
      email: string;
      password: string;
      displayName: string;
      role?: string;
    };
  }>("/", async (request, reply) => {
    if (request.user.role !== "admin") {
      return reply.status(403).send({ success: false, error: "Admin only" });
    }
    const { email, password, displayName, role } = request.body;
    const hash = hashSync(password, 10);
    const result = await db
      .insert(users)
      .values({
        email,
        passwordHash: hash,
        displayName,
        role: (role as "admin" | "editor") || "editor",
      })
      .returning({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .get();
    return { success: true, data: result };
  });

  app.put<{
    Params: { id: string };
    Body: {
      displayName?: string;
      role?: string;
      password?: string;
    };
  }>("/:id", async (request, reply) => {
    if (request.user.role !== "admin") {
      return reply.status(403).send({ success: false, error: "Admin only" });
    }
    const id = Number(request.params.id);
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "User not found" });
    }

    const updateData: Record<string, unknown> = {};
    if (request.body.displayName) updateData.displayName = request.body.displayName;
    if (request.body.role) updateData.role = request.body.role;
    if (request.body.password) updateData.passwordHash = hashSync(request.body.password, 10);

    if (Object.keys(updateData).length === 0) {
      return { success: true, data: existing };
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .get();
    return { success: true, data: result };
  });

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    if (request.user.role !== "admin") {
      return reply.status(403).send({ success: false, error: "Admin only" });
    }
    const id = Number(request.params.id);
    if (id === request.user.id) {
      return reply
        .status(400)
        .send({ success: false, error: "Cannot delete yourself" });
    }
    const existing = await db.select().from(users).where(eq(users.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: "User not found" });
    }
    await db.delete(users).where(eq(users.id, id)).run();
    return { success: true };
  });
}
