import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "@/app/actions";

type DeleteButtonProps = {
  id: number;
  label: string;
};

export function DeleteButton({ id, label }: DeleteButtonProps) {
  return (
    <form action={deleteExpense.bind(null, id)}>
      <Button variant="ghost" size="icon" type="submit" aria-label={`Delete ${label}`}>
        <Trash2 />
      </Button>
    </form>
  );
}
