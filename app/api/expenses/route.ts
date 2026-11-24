import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createExpense, getExpenses } from "@/lib/expenses";
import { expenseSchema } from "@/lib/validation";
import { badRequest, serverError, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/expenses -> my expenses
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    return NextResponse.json(await getExpenses(user.id));
  } catch (err) {
    return serverError("GET /api/expenses", err);
  }
}

// POST /api/expenses -> add an expense for me
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const parsed = expenseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  try {
    const expense = await createExpense(user.id, parsed.data);
    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    return serverError("POST /api/expenses", err);
  }
}
