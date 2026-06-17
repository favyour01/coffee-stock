import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupplierStats } from "@/lib/queries/dashboard";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { AnalisisSupplierClient } from "@/components/analisis/analisis-supplier-client";

export default async function AnalisisSupplierPage() {
  await requireRole(["owner", "admin"]);
  const stats = await getSupplierStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analisis Supplier"
        description="Supplier teraktif berdasarkan transaksi pembelian"
      />
      <Card>
        <CardHeader><CardTitle>Supplier Teraktif</CardTitle></CardHeader>
        <CardContent>
          <AnalisisSupplierClient stats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}
