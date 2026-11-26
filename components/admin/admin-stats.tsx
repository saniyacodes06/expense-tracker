//API se data fetch karke dashboard cards display karta hai.//
"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { Section } from "@/components/section";
import { FormMessage } from "@/components/form-message";
import { formatINR } from "@/lib/format";
import type { AdminStats, CategoryTotal } from "@/lib/admin";

type Stats = AdminStats & { topCategories: CategoryTotal[] };

export function AdminStatsView() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/admin/stats")
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error ?? "Could not load stats");
                setStats(data);
            })
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <FormMessage ok={false} message={error} />;
    if (!stats) return <p className="text-sm text-muted-foreground">Loading...</p>;

    return (
        <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-3">
                <StatCard label="Total users" value={stats.total_users} />
                <StatCard label="Total expenses" value={stats.total_expenses} />
                <StatCard label="Spent this month" value={formatINR(stats.month_total)} />
            </section>

            <Section title="Top 5 categories">
                {stats.topCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No expenses yet.</p>
                ) : (
                    <ul className="divide-y">
                        {stats.topCategories.map((c) => (
                            <li key={c.category} className="flex justify-between py-2">
                                <span>{c.category}</span>
                                <span className="font-medium">{formatINR(c.total)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
        </div>
    );
}