import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your daily expenses",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b bg-card">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <h1 className="text-xl font-bold">Expense Tracker</h1>
            {user && (
              <div className="flex items-center gap-3 text-sm">
                {/* only a shortcut: the admin pages and APIs check the role themselves */}
                {user.role === "ADMIN" && (
                  <nav className="flex gap-3">
                    <Link href="/" className="hover:underline">
                      My expenses
                    </Link>
                    <Link href="/admin" className="hover:underline">
                      Admin
                    </Link>
                    <Link href="/admin/users" className="hover:underline">
                      Users
                    </Link>
                    <Link href="/admin/expenses" className="hover:underline">
                      All expenses
                    </Link>
                  </nav>
                )}
                <Link href="/profile" className="hover:underline">
                  {user.name}
                </Link>
                <LogoutButton />
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
