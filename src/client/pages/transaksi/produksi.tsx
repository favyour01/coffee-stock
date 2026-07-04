import { useQuery } from "@tanstack/react-query";
import { recipeApi, productApi } from "@/lib/api";
import { ProduksiClient } from "@/components/transaksi/produksi-client";
import { PageHeader } from "@/components/layout/page-header";

export function ProduksiPage() {
  const { data: recipes = [] } = useQuery({ queryKey: ["recipes"], queryFn: recipeApi.list });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: productApi.list });

  return (
    <div className="space-y-6">
      <PageHeader title="Produksi / Menu" description="Kelola resep dan menu" />
      <ProduksiClient recipes={recipes} products={products} />
    </div>
  );
}
