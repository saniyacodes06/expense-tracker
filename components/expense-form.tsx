"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { addExpense, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { CategorySelect } from "@/components/category-select";
import { FormMessage } from "@/components/form-message";

const initialState: FormState = { ok: false, message: "" };

export function ExpenseForm() {
  const [state, formAction, isPending] = useActionState(addExpense, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // clear inputs after a successful save
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 sm:grid-cols-[1fr_140px_140px_auto] sm:items-end"
    >
      <FormField id="title" label="Title">
        <Input id="title" name="title" placeholder="e.g. Lunch" required />
      </FormField>

      <FormField id="amount" label="Amount (₹)">
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="150" required />
      </FormField>

      <FormField id="category" label="Category">
        <CategorySelect id="category" name="category" />
      </FormField>

      <Button type="submit" disabled={isPending}>
        <Plus />
        {isPending ? "Saving..." : "Add"}
      </Button>

      <FormMessage ok={state.ok} message={state.message} className="sm:col-span-4" />
    </form>
  );
}
