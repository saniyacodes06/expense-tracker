/*One form used by both pages. It calls the APIs you built in Steps 2 and 3.*/

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { FormMessage } from "@/components/form-message";

type AuthFormProps = {
    mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isPending, setIsPending] = useState(false);
    const isSignup = mode === "signup";

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsPending(true);

        const body = Object.fromEntries(new FormData(event.currentTarget));

        try {
            const res = await fetch(`/api/auth/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error ?? "Something went wrong");
                return;
            }

            // after signup -> log in; after login -> dashboard
            router.push(isSignup ? "/login" : "/");
            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            {isSignup && (
                <FormField id="name" label="Name">
                    <Input id="name" name="name" maxLength={100} required />
                </FormField>
            )}

            <FormField id="email" label="Email">
                <Input id="email" name="email" type="email" autoComplete="email" required />
            </FormField>

            <FormField id="password" label="Password">
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    minLength={isSignup ? 8 : undefined}
                    maxLength={72}
                    required
                />
            </FormField>

            <FormMessage ok={false} message={error} />

            <Button type="submit" disabled={isPending}>
                {isPending ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                {isSignup ? "Already have an account? " : "New here? "}
                <Link href={isSignup ? "/login" : "/signup"} className="underline">
                    {isSignup ? "Log in" : "Sign up"}
                </Link>
            </p>
        </form>
    );
}
