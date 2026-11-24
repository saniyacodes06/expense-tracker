import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
    try {
        await deleteSession();
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("POST /api/auth/logout failed:", err);
        return NextResponse.json({ error: "Could not log out" }, { status: 500 });
    }
}