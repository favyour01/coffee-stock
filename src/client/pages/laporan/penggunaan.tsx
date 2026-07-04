import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";

export function LaporanPenggunaanPage() {
  const { data } = useQuery({ queryKey: ["analytics", "usage"], queryFn: analyticsApi.usage });
  const usageData = data?.mostUsed ?? [];

  const columns = [
    { key: "nama", label: "Bahan" },
    { key: "satuan", label: "Satuan" },
    { key: "total", label: "Total Penggunaan" },
  ];

  const rows = usageData.map((u) => ({
    nama: u.nama_barang,
    satuan: u.satuan,
    total: Number(u.total_usage),
  }));

  const pdfColumns = ["Bahan", "Satuan", "Total Penggunaan"];
  const pdfRows = rows.map((r) => [r.nama, r.satuan, r.total]);

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Penggunaan" description="Laporan penggunaan bahan" />
      <ReportClient title="Laporan Penggunaan" columns={columns} data={rows} pdfColumns={pdfColumns} pdfRows={pdfRows} />
    </div>
  );
}
