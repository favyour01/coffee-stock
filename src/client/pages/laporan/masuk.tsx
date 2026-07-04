import { useQuery } from "@tanstack/react-query";
import { stockApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";
import { formatDate } from "@/lib/utils";

export function LaporanMasukPage() {
  const { data: stockIn = [] } = useQuery({ queryKey: ["stock-in"], queryFn: () => stockApi.inList() });

  const columns = [
    { key: "tanggal", label: "Tanggal" },
    { key: "barang", label: "Barang" },
    { key: "supplier", label: "Supplier" },
    { key: "qty", label: "Qty" },
    { key: "harga_beli", label: "Harga Beli" },
    { key: "total", label: "Total" },
  ];

  const data = stockIn.map((s) => ({
    tanggal: formatDate(s.tanggal),
    barang: s.product_nama ?? "-",
    supplier: s.supplier_nama ?? "-",
    qty: Number(s.qty),
    harga_beli: Number(s.harga_beli),
    total: Number(s.qty) * Number(s.harga_beli),
  }));

  const pdfColumns = ["Tanggal", "Barang", "Supplier", "Qty", "Harga Beli", "Total"];
  const pdfRows = data.map((r) => [r.tanggal, r.barang, r.supplier, r.qty, r.harga_beli, r.total]);

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Barang Masuk" description="Laporan penerimaan barang" />
      <ReportClient title="Laporan Barang Masuk" columns={columns} data={data} pdfColumns={pdfColumns} pdfRows={pdfRows} />
    </div>
  );
}
