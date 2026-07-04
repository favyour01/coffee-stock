import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";

export function LaporanPenggunaanPage() {
  const { data } = useQuery({ queryKey: ["analytics", "usage"], queryFn: analyticsApi.usage });
  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Penggunaan" description="Laporan penggunaan bahan" />
      <ReportClient type="penggunaan" usageData={data?.mostUsed ?? []} />
    </div>
  );
}
