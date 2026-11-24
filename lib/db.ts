import { Pool, type QueryResultRow } from "pg";

// reuse one pool across hot reloads in dev
const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export async function query<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
