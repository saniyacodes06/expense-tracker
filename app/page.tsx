import { getExpenses, getMonthSummary, getTopCategory } from "@/lib/expenses";
import { SummaryCards } from "@/components/summary-cards";
import { Section } from "@/components/section";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable } from "@/components/expense-table";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [expenses, summary, topCategory] = await Promise.all([
    getExpenses(),
    getMonthSummary(),
    getTopCategory(),
  ]);

  return (
    <div className="space-y-8">
      <SummaryCards summary={summary} topCategory={topCategory} />

      <Section title="Add expense">
        <ExpenseForm />
      </Section>

      <Section title="All expenses">
        <ExpenseTable expenses={expenses} />
      </Section>
    </div>
  );
}
