"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Section } from "@/components/section";
import { FormMessage } from "@/components/form-message";
import { CategoryBadge } from "@/components/category-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatINR } from "@/lib/format";
import type { AdminUser } from "@/lib/admin";
import type { Expense } from "@/lib/expenses";

type Detail = { user: Omit<AdminUser, "expense_count">; expenses: Expense[] };

export function UserDetail({ id }: { id: string }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/users/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Could not load user");
        setData(body);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <FormMessage ok={false} message={error} />;
  if (!data) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const { user, expenses } = data;

  return (
    <div className="space-y-8">
      <Link href="/admin/users" className="text-sm underline">
        Back to users
      </Link>

      <Section title={user.name}>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-muted-foreground">Phone</dt>
          <dd>{user.phone_last4 ?? "—"}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd>{user.role}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd>{user.is_active ? "Active" : "Deactivated"}</dd>
          <dt className="text-muted-foreground">Joined</dt>
          <dd>{formatDate(user.created_at)}</dd>
        </dl>
      </Section>

      <Section title={`Expenses (${expenses.length})`}>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.title}</TableCell>
                  <TableCell>
                    <CategoryBadge category={e.category} />
                  </TableCell>
                  <TableCell>{formatDate(e.created_at)}</TableCell>
                  <TableCell className="text-right">{formatINR(e.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>
    </div>
  );
}
