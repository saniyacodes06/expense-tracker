import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/admin";
import { parseId, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/admin/users?q=ravi&page=1
export async function GET(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    const params = new URL(request.url).searchParams;
    const search = (params.get("q") ?? "").trim().slice(0, 100);
    const page = parseId(params.get("page") ?? "1") ?? 1;

    try {
        return NextResponse.json(await listUsers(search, page));
    } catch (err) {
        return serverError("GET /api/admin/users", err);
    }
}