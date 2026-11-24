import { NextResponse } from "next/server";
import { getExpenses } from "@/lib/expenses";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const expenses = await getExpenses();
    return NextResponse.json(expenses);
  } catch (err) {
    console.error("GET /api/expenses failed:", err);
    return NextResponse.json({ error: "Failed to load expenses" }, { status: 500 });
  }
}
