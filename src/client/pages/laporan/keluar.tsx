import { useQuery } from "@tanstack/react-query";
import { stockApi, productApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";

export function LaporanKeluarPage() {
  const { data: stockOut = [] } = useQuery({ queryKey: ["stock-out"], queryFn: () => stockApi.outList() });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: productApi.list });
  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Barang Keluar" description="Laporan pemakaian barang" />
      <ReportClient type="keluar" stockOut={stockOut} products={products} />
    </div>
  );
}
