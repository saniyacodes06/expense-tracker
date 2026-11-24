import { z } from "zod";
import { CATEGORIES } from "@/lib/constants";

export const expenseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
  amount: z.coerce.number().positive("Amount must be more than 0"),
  category: z.enum(CATEGORIES),
});

export function parseExpenseForm(formData: FormData) {
  return expenseSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    category: formData.get("category"),
  });
}
