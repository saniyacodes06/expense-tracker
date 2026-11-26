import { query, queryOne } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";

export type Profile = {
  name: string;
  email: string;
  phone: string | null; // full number, only ever sent to the user themselves
};

// decrypt just after reading
export async function getProfile(userId: number): Promise<Profile | null> {
  const row = await queryOne<{ name: string; email: string; phone_encrypted: string | null }>(
    "SELECT name, email, phone_encrypted FROM users WHERE id = $1",
    [userId]
  );
  if (!row) return null;
  return {
    name: row.name,
    email: row.email,
    phone: row.phone_encrypted ? decrypt(row.phone_encrypted) : null,
  };
}

// encrypt just before saving. "" removes the phone.
export async function updatePhone(userId: number, phone: string) {
  await query("UPDATE users SET phone_encrypted = $1 WHERE id = $2", [
    phone ? encrypt(phone) : null,
    userId,
  ]);
}
