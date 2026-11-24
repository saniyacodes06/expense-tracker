import { readFile } from "node:fs/promises";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  await client.query(sql);
  console.log("Database ready");
} catch (err) {
  console.error("Database setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
