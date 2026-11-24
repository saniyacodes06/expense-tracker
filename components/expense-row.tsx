import { TableCell, TableRow } from "@/components/ui/table";
import { CategoryBadge } from "@/components/category-badge";
import { DeleteButton } from "@/components/delete-button";
import { BIG_EXPENSE_LIMIT } from "@/lib/constants";
import { formatDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Expense } from "@/lib/expenses";

function isBigExpense(amount: string) {
  return Number(amount) >= BIG_EXPENSE_LIMIT;
}

export function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{expense.title}</TableCell>
      <TableCell>
        <CategoryBadge category={expense.category} />
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(expense.created_at)}</TableCell>
      <TableCell
        className={cn("text-right", isBigExpense(expense.amount) && "font-semibold text-destructive")}
      >
        {formatINR(expense.amount)}
      </TableCell>
      <TableCell className="text-right">
        <DeleteButton id={expense.id} label={expense.title} />
      </TableCell>
    </TableRow>
  );
}
