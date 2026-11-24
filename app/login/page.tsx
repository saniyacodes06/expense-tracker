import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Section } from "@/components/section";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage() {
    // already logged in? go to the dashboard
    if (await getCurrentUser()) redirect("/");

    return (
        <div className="mx-auto max-w-sm">
            <Section title="Log in">
                <AuthForm mode="login" />
            </Section>
        </div>
    );
}
