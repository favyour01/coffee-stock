import { useQuery } from "@tanstack/react-query";
import { unitApi } from "@/lib/api";
import { SatuanClient } from "@/components/master/satuan-client";
import { PageHeader } from "@/components/layout/page-header";

export function SatuanPage() {
  const { data: units = [] } = useQuery({ queryKey: ["units"], queryFn: unitApi.list });
  return (
    <div className="space-y-6">
      <PageHeader title="Satuan" description="Kelola satuan barang" />
      <SatuanClient units={units} />
    </div>
  );
}
