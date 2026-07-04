import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api";
import { KategoriClient } from "@/components/master/kategori-client";
import { PageHeader } from "@/components/layout/page-header";

export function KategoriPage() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoryApi.list });
  return (
    <div className="space-y-6">
      <PageHeader title="Kategori" description="Kelola kategori barang" />
      <KategoriClient categories={categories} />
    </div>
  );
}
