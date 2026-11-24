import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getExpense, removeExpense, updateExpense } from "@/lib/expenses";
import { expenseSchema } from "@/lib/validation";
import { badRequest, notFound, parseId, serverError, unauthorized } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

const NOT_FOUND = "Expense not found";

// GET /api/expenses/5 -> one of MY expenses
export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const id = parseId((await params).id);
  if (!id) return notFound(NOT_FOUND);

  try {
    const expense = await getExpense(user.id, id);
    return expense ? NextResponse.json(expense) : notFound(NOT_FOUND);
  } catch (err) {
    return serverError("GET /api/expenses/[id]", err);
  }
}

// PATCH /api/expenses/5 -> edit one of MY expenses
export async function PATCH(request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const id = parseId((await params).id);
  if (!id) return notFound(NOT_FOUND);

  const parsed = expenseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  try {
    const expense = await updateExpense(user.id, id, parsed.data);
    return expense ? NextResponse.json(expense) : notFound(NOT_FOUND);
  } catch (err) {
    return serverError("PATCH /api/expenses/[id]", err);
  }
}

// DELETE /api/expenses/5 -> delete one of MY expenses
export async function DELETE(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const id = parseId((await params).id);
  if (!id) return notFound(NOT_FOUND);

  try {
    const deleted = await removeExpense(user.id, id);
    return deleted ? NextResponse.json({ ok: true }) : notFound(NOT_FOUND);
  } catch (err) {
    return serverError("DELETE /api/expenses/[id]", err);
  }
}
