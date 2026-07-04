import { useQuery } from "@tanstack/react-query";
import { recipeApi, saleApi } from "@/lib/api";
import { PenjualanClient } from "@/components/transaksi/penjualan-client";
import { PageHeader } from "@/components/layout/page-header";

export function PenjualanPage() {
  const { data: recipes = [] } = useQuery({ queryKey: ["recipes"], queryFn: recipeApi.list });
  const { data: sales = [] } = useQuery({ queryKey: ["sales"], queryFn: () => saleApi.list() });

  return (
    <div className="space-y-6">
      <PageHeader title="Penjualan" description="Catat transaksi penjualan" />
      <PenjualanClient recipes={recipes} sales={sales} />
    </div>
  );
}
