import { requireAdminPage } from "@/lib/auth";
import { UserDetail } from "@/components/admin/user-detail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">User details</h2>
      <UserDetail id={id} />
    </div>
  );
}
