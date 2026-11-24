import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { forbidden, unauthorized } from "@/lib/api";

export const SESSION_COOKIE = "session";
const SESSION_DAYS = 7;

export type CurrentUser = {
    id: number;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
};

// called after a correct password: make a token, save it, send it as a cookie
export async function createSession(userId: number) {
    const token = randomBytes(32).toString("hex");

    await query(
        `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '${SESSION_DAYS} days')`,
        [token, userId]
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true, // JavaScript in the browser cannot read it
        sameSite: "lax", // not sent on POSTs coming from other sites
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        path: "/",
        maxAge: SESSION_DAYS * 24 * 60 * 60, // seconds
    });
}

// logout: delete the session row on the server and clear the cookie
export async function deleteSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
        await query("DELETE FROM sessions WHERE token = $1", [token]);
    }
    cookieStore.delete(SESSION_COOKIE);
}

// who is making this request? returns the user, or null
export async function getCurrentUser(): Promise<CurrentUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    // one query: the session exists, is not expired, and the user is still active
    return queryOne<CurrentUser>(
        `SELECT u.id, u.name, u.email, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1
       AND s.expires_at > NOW()
       AND u.is_active = TRUE`,
        [token]
    );
}

type AdminCheck =
    | { admin: CurrentUser; error: null }
    | { admin: null; error: NextResponse };

// for admin API routes: 401 if not logged in, 403 if logged in but not ADMIN
export async function requireAdmin(): Promise<AdminCheck> {
    const user = await getCurrentUser();
    if (!user) return { admin: null, error: unauthorized() };
    if (user.role !== "ADMIN") return { admin: null, error: forbidden() };
    return { admin: user, error: null };
}

// for admin pages: send non-admins away instead of showing the page
export async function requireAdminPage(): Promise<CurrentUser> {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    if (user.role !== "ADMIN") redirect("/");
    return user;
}
