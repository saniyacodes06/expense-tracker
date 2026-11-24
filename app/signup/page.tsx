import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Section } from "@/components/section";
import { AuthForm } from "@/components/auth-form";

export default async function SignupPage() {
    if (await getCurrentUser()) redirect("/");

    return (
        <div className="mx-auto max-w-sm">
            <Section title="Create account">
                <AuthForm mode="signup" />
            </Section>
        </div>
    );
}
