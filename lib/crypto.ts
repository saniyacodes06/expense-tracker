// Encryption at rest for sensitive fields (the phone number).
// AES-256-GCM from Node's crypto module. Server only: the key never goes to the browser.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // the size GCM expects
const TAG_BYTES = 16;

// the key lives in .env.local as 64 hex characters (= 32 bytes)
function getKey() {
  const hex = process.env.ENCRYPTION_KEY ?? "";
  if (!/^[0-9a-f]{64}$/i.test(hex)) {
    throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

// "9876543210" -> "iv:tag:ciphertext" (all hex). A new random IV every call,
// so the same phone number gives a different stored value each time.
export function encrypt(text: string) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("hex")).join(":");
}

// "iv:tag:ciphertext" -> "9876543210". Throws if the value was changed
// (the auth tag no longer matches) or the key is wrong. Never returns wrong data.
export function decrypt(stored: string) {
  const [ivHex, tagHex, dataHex] = stored.split(":");
  if (!ivHex || !tagHex || dataHex === undefined) throw new Error("Bad encrypted value");

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) throw new Error("Bad encrypted value");

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}

// for the admin table: "••••3210", or null if there is no phone
export function lastFourDigits(stored: string | null) {
  if (!stored) return null;
  try {
    return `••••${decrypt(stored).slice(-4)}`;
  } catch (err) {
    console.error("Could not decrypt a phone number:", err);
    return "unreadable";
  }
}
