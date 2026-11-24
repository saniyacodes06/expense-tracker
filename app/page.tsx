import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getExpenses, getMonthSummary, getTopCategory } from "@/lib/expenses";
import { SummaryCards } from "@/components/summary-cards";
import { Section } from "@/components/section";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable } from "@/components/expense-table";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [expenses, summary, topCategory] = await Promise.all([
    getExpenses(user.id),
    getMonthSummary(user.id),
    getTopCategory(user.id),
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