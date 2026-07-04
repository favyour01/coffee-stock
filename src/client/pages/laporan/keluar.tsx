import { useQuery } from "@tanstack/react-query";
import { stockApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";
import { formatDate } from "@/lib/utils";

export function LaporanKeluarPage() {
  const { data: stockOut = [] } = useQuery({ queryKey: ["stock-out"], queryFn: () => stockApi.outList() });

  const columns = [
    { key: "tanggal", label: "Tanggal" },
    { key: "barang", label: "Barang" },
    { key: "qty", label: "Qty" },
    { key: "keterangan", label: "Keterangan" },
    { key: "user", label: "Petugas" },
  ];

  const data = stockOut.map((s) => ({
    tanggal: formatDate(s.tanggal),
    barang: s.product_nama ?? "-",
    qty: Number(s.qty),
    keterangan: s.keterangan ?? "-",
    user: s.user_nama ?? "-",
  }));

  const pdfColumns = ["Tanggal", "Barang", "Qty", "Keterangan", "Petugas"];
  const pdfRows = data.map((r) => [r.tanggal, r.barang, r.qty, r.keterangan, r.user]);

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Barang Keluar" description="Laporan pemakaian barang" />
      <ReportClient title="Laporan Barang Keluar" columns={columns} data={data} pdfColumns={pdfColumns} pdfRows={pdfRows} />
    </div>
  );
}
