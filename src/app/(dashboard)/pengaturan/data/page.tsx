import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { DataManagementClient } from "@/components/pengaturan/data-client";

export default async function DataManagementPage() {
  await requireRole(["owner"]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Data"
        description="Reset atau bersihkan data inventaris tanpa menghapus akun user"
      />
      <DataManagementClient />
    </div>
  );
}
