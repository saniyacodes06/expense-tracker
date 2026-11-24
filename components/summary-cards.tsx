import { StatCard } from "@/components/stat-card";
import { formatINR } from "@/lib/format";
import type { MonthSummary } from "@/lib/expenses";

type SummaryCardsProps = {
  summary: MonthSummary;
  topCategory: string | null;
};

export function SummaryCards({ summary, topCategory }: SummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <StatCard label="This month" value={formatINR(summary.total)} />
      <StatCard label="Entries this month" value={summary.count} />
      <StatCard label="Top category" value={topCategory ?? "—"} />
    </section>
  );
}
