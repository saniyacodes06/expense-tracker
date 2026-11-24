"use server";

import { revalidatePath } from "next/cache";
import { createExpense, removeExpense } from "@/lib/expenses";
import { parseExpenseForm } from "@/lib/validation";

export type FormState = { ok: boolean; message: string };

function fail(message: string): FormState {
  return { ok: false, message };
}

export async function addExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseExpenseForm(formData);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  try {
    await createExpense(parsed.data);
  } catch (err) {
    console.error("addExpense failed:", err);
    return fail("Could not save. Please try again.");
  }

  revalidatePath("/");
  return { ok: true, message: "Expense added" };
}

export async function deleteExpense(id: number) {
  await removeExpense(id);
  revalidatePath("/");
}
