"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormMessage } from "@/components/form-message";
import { CategoryBadge } from "@/components/category-badge";
import { CATEGORIES, type Category } from "@/lib/constants";
import { formatDate, formatINR } from "@/lib/format";
import type { AdminExpense } from "@/lib/admin";

type ExpensesResponse = { expenses: AdminExpense[]; total: number; page: number; totalPages: number };
type Filters = { user: string; category: string; from: string; to: string };

const EMPTY: Filters = { user: "", category: "", from: "", to: "" };
const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function ExpensesTable() {
  const [form, setForm] = useState<Filters>(EMPTY); // what is in the inputs
  const [filters, setFilters] = useState<Filters>(EMPTY); // what we actually filtered by
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ExpensesResponse | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ ...filters, page: String(page) });
    const res = await fetch(`/api/admin/expenses?${params}`);
    const body = await res.json();
    if (!res.ok) return setError(body.error ?? "Could not load expenses");
    setError("");
    setData(body);
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setFilters(form);
  }

  function clear() {
    setForm(EMPTY);
    setFilters(EMPTY);
    setPage(1);
  }

  async function remove(expense: AdminExpense) {
    if (!window.confirm(`Delete "${expense.title}" of ${expense.user_email}?`)) return;

    const res = await fetch(`/api/admin/expenses/${expense.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return setError(body.error ?? "Delete failed");
    }
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={apply} className="grid gap-2 sm:grid-cols-[1fr_140px_150px_150px_auto_auto]">
        <Input
          value={form.user}
          onChange={(e) => setForm({ ...form, user: e.target.value })}
          placeholder="User email"
          maxLength={100}
        />
        <select
          aria-label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={selectClass}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Input
          type="date"
          aria-label="From"
          value={form.from}
          onChange={(e) => setForm({ ...form, from: e.target.value })}
        />
        <Input
          type="date"
          aria-label="To"
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
        />
        <Button type="submit">Filter</Button>
        <Button type="button" variant="outline" onClick={clear}>
          Clear
        </Button>
      </form>

      <FormMessage ok={false} message={error} />

      {!data ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : data.expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No expenses found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.expenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.title}</TableCell>
                <TableCell>
                  <Link href={`/admin/users/${e.user_id}`} className="underline">
                    {e.user_email}
                  </Link>
                </TableCell>
                <TableCell>
                  <CategoryBadge category={e.category as Category} />
                </TableCell>
                <TableCell>{formatDate(e.created_at)}</TableCell>
                <TableCell className="text-right">{formatINR(e.amount)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" aria-label={`Delete ${e.title}`} onClick={() => remove(e)}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {data && (
        <div className="flex items-center justify-between text-sm">
          <span>
            Page {data.page} of {data.totalPages} ({data.total} expenses)
          </span>
          <div className="space-x-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
