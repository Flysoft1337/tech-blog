import { buildApp } from "./app.js";
import { initDatabase } from "./db/index.js";

const PORT = Number(process.env.PORT) || 3000;

await initDatabase();

const app = await buildApp();

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
