import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExpenseRow } from "@/components/expense-row";
import type { Expense } from "@/lib/expenses";

const COLUMNS = ["Title", "Category", "Date"];

export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return <p className="text-sm text-muted-foreground">No expenses yet. Add one above.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((col) => (
            <TableHead key={col}>{col}</TableHead>
          ))}
          <TableHead className="text-right">Amount</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <ExpenseRow key={expense.id} expense={expense} />
        ))}
      </TableBody>
    </Table>
  );
}
