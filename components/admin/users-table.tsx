"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormMessage } from "@/components/form-message";
import { formatDate } from "@/lib/format";
import type { AdminUser } from "@/lib/admin";

type UsersResponse = { users: AdminUser[]; total: number; page: number; totalPages: number };
type Changes = { role?: "USER" | "ADMIN"; isActive?: boolean };

export function UsersTable({ currentAdminId }: { currentAdminId: number }) {
  const [search, setSearch] = useState(""); // what is typed in the box
  const [query, setQuery] = useState(""); // what we actually searched for
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ q: query, page: String(page) });
    const res = await fetch(`/api/admin/users?${params}`);
    const body = await res.json();
    if (!res.ok) return setError(body.error ?? "Could not load users");
    setData(body);
  }, [query, page]);

  useEffect(() => {
    load();
  }, [load]);

  function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  async function update(user: AdminUser, changes: Changes, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setError("");

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return setError(body.error ?? "Update failed");
    }
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email"
          maxLength={100}
        />
        <Button type="submit">Search</Button>
      </form>

      <FormMessage ok={false} message={error} />

      {!data ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : data.users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.map((user) => {
              const isSelf = user.id === currentAdminId;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`} className="underline">
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.is_active ? "Active" : "Deactivated"}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">{user.expense_count}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    {isSelf ? (
                      <span className="text-sm text-muted-foreground">(you)</span>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            update(
                              user,
                              { role: user.role === "ADMIN" ? "USER" : "ADMIN" },
                              `Change ${user.email} to ${user.role === "ADMIN" ? "USER" : "ADMIN"}?`
                            )
                          }
                        >
                          {user.role === "ADMIN" ? "Make user" : "Make admin"}
                        </Button>
                        <Button
                          size="sm"
                          variant={user.is_active ? "destructive" : "outline"}
                          onClick={() =>
                            update(
                              user,
                              { isActive: !user.is_active },
                              user.is_active
                                ? `Deactivate ${user.email}? They will be logged out at once.`
                                : `Reactivate ${user.email}?`
                            )
                          }
                        >
                          {user.is_active ? "Deactivate" : "Reactivate"}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {data && (
        <div className="flex items-center justify-between text-sm">
          <span>
            Page {data.page} of {data.totalPages} ({data.total} users)
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
