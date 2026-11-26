import { z } from "zod";
import { CATEGORIES } from "@/lib/constants";

export const expenseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
  amount: z.coerce.number().positive("Amount must be more than 0"),
  category: z.enum(CATEGORIES),
});

export function parseExpenseForm(formData: FormData) {
  return expenseSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    category: formData.get("category"),
  });
}

// signup: what we accept from the browser. Anything else (like "role") is dropped.
export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Email is too long")
    .pipe(z.email("Enter a valid email")),
  // bcrypt only uses the first 72 bytes, so we cap it there
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});
// login: we only check that something was sent. No hints about what was wrong.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().min(1).max(72),
});
// admin: change a user's role and/or active status
export const adminUserUpdateSchema = z
  .object({
    role: z.enum(["USER", "ADMIN"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.role !== undefined || d.isActive !== undefined, "Nothing to update");