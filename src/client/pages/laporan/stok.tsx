import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";

export function LaporanStokPage() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: productApi.list });
  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Stok" description="Laporan stok barang saat ini" />
      <ReportClient type="stok" products={products} />
    </div>
  );
}
