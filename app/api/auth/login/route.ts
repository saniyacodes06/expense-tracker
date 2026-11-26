import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { clearLoginFailures, isLoginBlocked, recordLoginFailure } from "@/lib/rate-limit";

const INVALID = "Invalid email or password";

// used when the email doesn't exist, so the response takes the same time
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: INVALID }, { status: 400 });
    }
    const { email, password } = parsed.data;

    // too many wrong passwords for this email in the last 15 minutes
    if (isLoginBlocked(email)) {
        return NextResponse.json(
            { error: "Too many failed logins. Try again in 15 minutes." },
            { status: 429, headers: { "Retry-After": "900" } }
        );
    }

    try {
        const user = await queryOne<{ id: number; password_hash: string; is_active: boolean }>(
            "SELECT id, password_hash, is_active FROM users WHERE email = $1",
            [email]
        );

        // always run bcrypt, even if the user doesn't exist
        const passwordOk = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

        if (!user || !passwordOk || !user.is_active) {
            recordLoginFailure(email);
            return NextResponse.json({ error: INVALID }, { status: 401 });
        }

        clearLoginFailures(email);
        await createSession(user.id);
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("POST /api/auth/login failed:", err);
        return NextResponse.json({ error: "Could not log in. Please try again." }, { status: 500 });
    }
}