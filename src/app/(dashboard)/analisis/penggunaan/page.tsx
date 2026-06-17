import { PageHeader } from "@/components/layout/page-header";
import { getUsageAnalysis } from "@/lib/queries/dashboard";
import { requireRole } from "@/lib/auth/session";
import { PenggunaanClient } from "@/components/analisis/penggunaan-client";

export default async function PenggunaanPage() {
  await requireRole(["owner", "admin"]);
  const { mostUsed, leastUsed } = await getUsageAnalysis();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analisis Penggunaan Barang"
        description="Barang paling banyak dan paling jarang digunakan bulan ini"
      />
      <PenggunaanClient mostUsed={mostUsed} leastUsed={leastUsed} />
    </div>
  );
}
