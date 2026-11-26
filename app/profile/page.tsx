import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Section } from "@/components/section";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!(await getCurrentUser())) redirect("/login");

  return (
    <div className="mx-auto max-w-lg">
      <Section title="My profile">
        <ProfileForm />
      </Section>
    </div>
  );
}
