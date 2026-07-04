import { useQuery } from "@tanstack/react-query";
import { stockApi, supplierApi, productApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";

export function LaporanMasukPage() {
  const { data: stockIn = [] } = useQuery({ queryKey: ["stock-in"], queryFn: () => stockApi.inList() });
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: supplierApi.list });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: productApi.list });
  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Barang Masuk" description="Laporan penerimaan barang" />
      <ReportClient type="masuk" stockIn={stockIn} suppliers={suppliers} products={products} />
    </div>
  );
}
