import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { PenggunaanClient } from "@/components/analisis/penggunaan-client";
import { PageHeader } from "@/components/layout/page-header";

export function PenggunaanPage() {
  const { data } = useQuery({ queryKey: ["analytics", "usage"], queryFn: analyticsApi.usage });
  return (
    <div className="space-y-6">
      <PageHeader title="Analisis Penggunaan" description="Analisis penggunaan bahan" />
      <PenggunaanClient mostUsed={data?.mostUsed ?? []} leastUsed={data?.leastUsed ?? []} />
    </div>
  );
}
