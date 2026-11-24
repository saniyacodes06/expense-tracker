import type { Metadata } from "next";
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
                <span>{user.name}</span>
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
