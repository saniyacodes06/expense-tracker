import { requireAdminPage } from "@/lib/auth";
import { Section } from "@/components/section";
import { ExpensesTable } from "@/components/admin/expenses-table";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  await requireAdminPage();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">All expenses</h2>
      <Section title="Expenses from every user">
        <ExpensesTable />
      </Section>
    </div>
  );
}
