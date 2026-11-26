//	Admin page open karta hai and access check karta hai.//
import { requireAdminPage } from "@/lib/auth";
import { AdminStatsView } from "@/components/admin/admin-stats";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    await requireAdminPage();

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Admin dashboard</h2>
            <AdminStatsView />
        </div>
    );
}
