import { readFile } from "node:fs/promises";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
// "npm run db:reset" wipes old tables first (dev only)
const reset = process.argv.includes("--reset");

try {
  await client.connect();
  if (reset) {
    await client.query("DROP TABLE IF EXISTS sessions, expenses, users CASCADE");
    console.log("Old tables dropped");
  }

  const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  await client.query(sql);
  console.log("Database ready");
} catch (err) {
  console.error("Database setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
