import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";

export function LaporanSupplierPage() {
  const { data: supplierStats = [] } = useQuery({ queryKey: ["analytics", "suppliers"], queryFn: analyticsApi.suppliers });
  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Supplier" description="Laporan pembelian per supplier" />
      <ReportClient type="supplier" supplierStats={supplierStats} />
    </div>
  );
}
