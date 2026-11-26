import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getUser, updateUser } from "@/lib/admin";
import { getExpenses } from "@/lib/expenses";
import { adminUserUpdateSchema } from "@/lib/validation";
import { badRequest, notFound, parseId, serverError } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/3  body: { "role": "ADMIN" } or { "isActive": false }
export async function PATCH(request: Request, { params }: Context) {
    const { admin, error } = await requireAdmin();
    if (error) return error;

    const id = parseId((await params).id);
    if (!id) return notFound("User not found");

    const parsed = adminUserUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return badRequest(parsed.error.issues[0].message);
    const changes = parsed.data;

    // an admin cannot lock themselves out
    if (id === admin.id && (changes.isActive === false || changes.role === "USER")) {
        return badRequest("You cannot deactivate yourself or remove your own admin role");
    }

    try {
        const user = await updateUser(id, changes);
        return user ? NextResponse.json(user) : notFound("User not found");
    } catch (err) {
        return serverError("PATCH /api/admin/users/[id]", err);
    }
}

// GET /api/admin/users/3 -> user details + their expenses (read only)
export async function GET(_request: Request, { params }: Context) {
    const { error } = await requireAdmin();
    if (error) return error;

    const id = parseId((await params).id);
    if (!id) return notFound("User not found");

    try {
        const user = await getUser(id);
        if (!user) return notFound("User not found");

        const expenses = await getExpenses(id);
        return NextResponse.json({ user, expenses });
    } catch (err) {
        return serverError("GET /api/admin/users/[id]", err);
    }
}