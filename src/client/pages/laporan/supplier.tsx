import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";

export function LaporanSupplierPage() {
  const { data: supplierStats = [] } = useQuery({ queryKey: ["analytics", "suppliers"], queryFn: analyticsApi.suppliers });

  const columns = [
    { key: "nama", label: "Supplier" },
    { key: "transaksi", label: "Jumlah Transaksi" },
    { key: "total_pembelian", label: "Total Pembelian" },
  ];

  const data = supplierStats.map((s) => ({
    nama: s.nama,
    transaksi: Number(s.transaction_count),
    total_pembelian: Number(s.total_pembelian),
  }));

  const pdfColumns = ["Supplier", "Jumlah Transaksi", "Total Pembelian"];
  const pdfRows = data.map((r) => [r.nama, r.transaksi, r.total_pembelian]);

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Supplier" description="Laporan pembelian per supplier" />
      <ReportClient title="Laporan Supplier" columns={columns} data={data} pdfColumns={pdfColumns} pdfRows={pdfRows} />
    </div>
  );
}
