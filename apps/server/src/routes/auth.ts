import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { compareSync, hashSync } from "bcryptjs";

export default async function authRoutes(app: FastifyInstance) {
  // Login
  app.post<{
    Body: { email: string; password: string };
  }>("/login", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user || !compareSync(password, user.passwordHash)) {
      return reply
        .status(401)
        .send({ success: false, error: "Invalid credentials" });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = app.jwt.sign(payload);
    const refreshToken = app.jwt.sign(payload, { expiresIn: "7d" });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tokens: { accessToken, refreshToken },
      },
    };
  });

  // Refresh token
  app.post<{
    Body: { refreshToken: string };
  }>("/refresh", async (request, reply) => {
    try {
      const decoded = app.jwt.verify<{
        id: number;
        email: string;
        role: string;
      }>(request.body.refreshToken);
      const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
      const accessToken = app.jwt.sign(payload);
      const refreshToken = app.jwt.sign(payload, { expiresIn: "7d" });
      return { success: true, data: { accessToken, refreshToken } };
    } catch {
      return reply
        .status(401)
        .send({ success: false, error: "Invalid refresh token" });
    }
  });

  // Get current user
  app.get(
    "/me",
    { onRequest: [app.authenticate] },
    async (request) => {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, request.user.id))
        .get();

      if (!user) {
        return { success: false, error: "User not found" };
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    }
  );
}
