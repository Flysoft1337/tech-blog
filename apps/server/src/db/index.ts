import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { hashSync } from "bcryptjs";
import { sql } from "drizzle-orm";

const dbPath = process.env.DATABASE_PATH || "./data/blog.db";
const dir = dirname(dbPath);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const absolutePath = resolve(dbPath);
const client = createClient({ url: `file:${absolutePath}` });

export const db = drizzle(client, { schema });

export async function initDatabase() {
  await client.execute("PRAGMA journal_mode = WAL");
  await client.execute("PRAGMA foreign_keys = ON");

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      content_html TEXT NOT NULL,
      excerpt TEXT,
      cover_image TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      pinned INTEGER NOT NULL DEFAULT 0,
      view_count INTEGER NOT NULL DEFAULT 0,
      author_id INTEGER NOT NULL REFERENCES users(id),
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      series_id INTEGER REFERENCES series(id) ON DELETE SET NULL,
      series_order INTEGER,
      published_at TEXT,
      scheduled_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      parent_id INTEGER,
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      author_url TEXT,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      uploader_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      ip TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await seedDefaults();

  // Migrations for existing databases
  const migrations = [
    "ALTER TABLE posts ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE posts ADD COLUMN series_id INTEGER REFERENCES series(id) ON DELETE SET NULL",
    "ALTER TABLE posts ADD COLUMN series_order INTEGER",
    "ALTER TABLE posts ADD COLUMN scheduled_at TEXT",
    "ALTER TABLE users ADD COLUMN bio TEXT",
    "ALTER TABLE users ADD COLUMN website TEXT",
  ];
  for (const m of migrations) {
    try { await client.execute(m); } catch {}
  }
}

async function seedDefaults() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await client.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [adminEmail],
  });

  if (existing.rows.length === 0) {
    const hash = hashSync(adminPassword, 10);
    await client.execute({
      sql: "INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)",
      args: [adminEmail, hash, "Admin", "admin"],
    });
  }

  const defaultSettings = [
    ["siteName", "My Tech Blog"],
    ["siteDescription", "A personal tech blog"],
    ["siteUrl", "https://example.com"],
    ["postsPerPage", "10"],
    ["commentModeration", "true"],
  ];

  for (const [key, value] of defaultSettings) {
    await client.execute({
      sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      args: [key, value],
    });
  }
}
