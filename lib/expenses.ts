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

export function getExpenses() {
  return query<Expense>(
    `SELECT id, title, amount, category, created_at
     FROM expenses
     ORDER BY created_at DESC`
  );
}

export async function getMonthSummary() {
  const row = await queryOne<MonthSummary>(
    `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
     FROM expenses
     WHERE date_trunc('month', created_at) = date_trunc('month', NOW())`
  );
  return row ?? { total: "0", count: "0" };
}

export async function getTopCategory() {
  const row = await queryOne<{ category: Category }>(
    `SELECT category
     FROM expenses
     GROUP BY category
     ORDER BY SUM(amount) DESC
     LIMIT 1`
  );
  return row?.category ?? null;
}

export async function createExpense({ title, amount, category }: NewExpense) {
  await query(
    "INSERT INTO expenses (title, amount, category) VALUES ($1, $2, $3)",
    [title, amount, category]
  );
}

export async function removeExpense(id: number) {
  await query("DELETE FROM expenses WHERE id = $1", [id]);
}
