import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats } from "@/lib/admin";
import { serverError } from "@/lib/api";
//serverError: DB me kuch gadbad hui toh poora error sirf server log me jaata hai. Browser ko bas "Something went wrong" milta hai//

//force-dynamic - retrun fresh num, not the older cached one//
export const dynamic = "force-dynamic";

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        return NextResponse.json(await getAdminStats());
    } catch (err) {
        return serverError("GET /api/admin/stats", err);
    }
}