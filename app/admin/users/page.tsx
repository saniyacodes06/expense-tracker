import { requireAdminPage } from "@/lib/auth";
import { Section } from "@/components/section";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdminPage();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Users</h2>
      <Section title="All users">
        <UsersTable currentAdminId={admin.id} />
      </Section>
    </div>
  );
}
