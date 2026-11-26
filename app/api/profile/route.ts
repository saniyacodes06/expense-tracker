import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProfile, updatePhone } from "@/lib/profile";
import { profileSchema } from "@/lib/validation";
import { badRequest, serverError, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/profile -> my name, email and full phone number
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    return NextResponse.json(await getProfile(user.id));
  } catch (err) {
    return serverError("GET /api/profile", err);
  }
}

// PATCH /api/profile  body: { "phone": "9876543210" }  ("" removes it)
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  try {
    await updatePhone(user.id, parsed.data.phone);
    return NextResponse.json(await getProfile(user.id));
  } catch (err) {
    return serverError("PATCH /api/profile", err);
  }
}
