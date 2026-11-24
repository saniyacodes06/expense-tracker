import { query, queryOne } from "@/lib/db";
import type { Category } from "@/lib/constants";

export type Expense = {
  id: number;
  title: string;
  amount: string; // pg returns NUMERIC as string
  category: Category;
  created_at: Date;
};

export type NewExpense = {
  title: string;
  amount: number;
  category: Category;
};

export type MonthSummary = {
  total: string;
  count: string;
};

// every query filters by user_id, which always comes from the session
const COLUMNS = "id, title, amount, category, created_at";

export function getExpenses(userId: number) {
  return query<Expense>(
    `SELECT ${COLUMNS} FROM expenses
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
}

export function getExpense(userId: number, id: number) {
  return queryOne<Expense>(
    `SELECT ${COLUMNS} FROM expenses WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
}

export async function getMonthSummary(userId: number) {
  const row = await queryOne<MonthSummary>(
    `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
     FROM expenses
     WHERE user_id = $1
       AND date_trunc('month', created_at) = date_trunc('month', NOW())`,
    [userId]
  );
  return row ?? { total: "0", count: "0" };
}

export async function getTopCategory(userId: number) {
  const row = await queryOne<{ category: Category }>(
    `SELECT category FROM expenses
     WHERE user_id = $1
     GROUP BY category
     ORDER BY SUM(amount) DESC
     LIMIT 1`,
    [userId]
  );
  return row?.category ?? null;
}

export function createExpense(userId: number, { title, amount, category }: NewExpense) {
  return queryOne<Expense>(
    `INSERT INTO expenses (user_id, title, amount, category)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
    [userId, title, amount, category]
  );
}

// returns null if the expense doesn't exist OR belongs to someone else
export function updateExpense(userId: number, id: number, { title, amount, category }: NewExpense) {
  return queryOne<Expense>(
    `UPDATE expenses SET title = $1, amount = $2, category = $3
     WHERE id = $4 AND user_id = $5
     RETURNING ${COLUMNS}`,
    [title, amount, category, id, userId]
  );
}

// returns true only if a row of THIS user was deleted
export async function removeExpense(userId: number, id: number) {
  const row = await queryOne<{ id: number }>(
    "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return row !== null;
}
