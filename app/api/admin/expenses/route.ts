import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listExpenses } from "@/lib/admin";
import { adminExpenseFiltersSchema } from "@/lib/validation";
import { badRequest, parseId, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/admin/expenses?user=ravi&category=Food&from=2026-11-01&to=2026-11-30&page=1
export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const params = new URL(request.url).searchParams;
  const field = (name: string) => params.get(name)?.trim() || undefined; // "" -> undefined

  const parsed = adminExpenseFiltersSchema.safeParse({
    user: field("user"),
    category: field("category"),
    from: field("from"),
    to: field("to"),
  });
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const page = parseId(params.get("page") ?? "1") ?? 1;

  try {
    return NextResponse.json(await listExpenses(parsed.data, page));
  } catch (err) {
    return serverError("GET /api/admin/expenses", err);
  }
}
