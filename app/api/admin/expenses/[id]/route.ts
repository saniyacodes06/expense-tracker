import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteAnyExpense } from "@/lib/admin";
import { notFound, parseId, serverError } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

// DELETE /api/admin/expenses/7 -> admin deletes any user's expense
export async function DELETE(_request: Request, { params }: Context) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = parseId((await params).id);
  if (!id) return notFound("Expense not found");

  try {
    const deleted = await deleteAnyExpense(id);
    return deleted ? NextResponse.json({ ok: true }) : notFound("Expense not found");
  } catch (err) {
    return serverError("DELETE /api/admin/expenses/[id]", err);
  }
}
