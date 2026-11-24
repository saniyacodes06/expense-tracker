"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createExpense, removeExpense } from "@/lib/expenses";
import { parseExpenseForm } from "@/lib/validation";

export type FormState = { ok: boolean; message: string };

function fail(message: string): FormState {
  return { ok: false, message };
}

// server actions are public POST endpoints too, so they check the user as well
export async function addExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return fail("Please log in again.");

  const parsed = parseExpenseForm(formData);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  try {
    await createExpense(user.id, parsed.data);
  } catch (err) {
    console.error("addExpense failed:", err);
    return fail("Could not save. Please try again.");
  }

  revalidatePath("/");
  return { ok: true, message: "Expense added" };
}

export async function deleteExpense(id: number) {
  const user = await getCurrentUser();
  if (!user || !Number.isInteger(id)) return;

  try {
    await removeExpense(user.id, id);
  } catch (err) {
    console.error("deleteExpense failed:", err);
    return;
  }
  revalidatePath("/");
}
