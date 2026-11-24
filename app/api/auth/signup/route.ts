import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
    // 1. read and check the input
    const body = await request.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    try {
        // 2. hash the password (cost 10). The plain password is never saved or logged.
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. save the user. role is not sent, so the database default 'USER' is used.
        const user = await queryOne<{ id: number }>(
            `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
            [name, email, passwordHash]
        );

        if (!user) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err) {
        console.error("POST /api/auth/signup failed:", err);
        return NextResponse.json({ error: "Could not sign up. Please try again." }, { status: 500 });
    }
}