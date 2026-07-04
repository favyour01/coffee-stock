import { useQuery } from "@tanstack/react-query";
import { productApi, supplierApi, stockApi } from "@/lib/api";
import { StockInClient } from "@/components/transaksi/stock-in-client";
import { PageHeader } from "@/components/layout/page-header";

export function MasukPage() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: productApi.list });
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: supplierApi.list });
  const { data: history = [] } = useQuery({ queryKey: ["stock-in"], queryFn: () => stockApi.inList() });

  return (
    <div className="space-y-6">
      <PageHeader title="Barang Masuk" description="Catat penerimaan barang dari supplier" />
      <StockInClient products={products} suppliers={suppliers} history={history} />
    </div>
  );
}
