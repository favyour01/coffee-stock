import { useQuery } from "@tanstack/react-query";
import { productApi, stockApi } from "@/lib/api";
import { StockOutClient } from "@/components/transaksi/stock-out-client";
import { PageHeader } from "@/components/layout/page-header";

export function KeluarPage() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: productApi.list });
  const { data: history = [] } = useQuery({ queryKey: ["stock-out"], queryFn: () => stockApi.outList() });

  return (
    <div className="space-y-6">
      <PageHeader title="Barang Keluar" description="Catat barang keluar / pemakaian" />
      <StockOutClient products={products} history={history} />
    </div>
  );
}
