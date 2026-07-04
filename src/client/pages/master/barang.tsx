import { useQuery } from "@tanstack/react-query";
import { productApi, categoryApi, supplierApi } from "@/lib/api";
import { BarangClient } from "@/components/master/barang-client";
import { PageHeader } from "@/components/layout/page-header";

export function BarangPage() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: productApi.list });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoryApi.list });
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: supplierApi.list });
  const { data: units = [] } = useQuery({ queryKey: ["units"], queryFn: () => import("@/lib/api").then(m => m.unitApi.list()) });

  return (
    <div className="space-y-6">
      <PageHeader title="Barang" description="Kelola master data barang" />
      <BarangClient products={products} categories={categories} suppliers={suppliers} units={units} />
    </div>
  );
}
