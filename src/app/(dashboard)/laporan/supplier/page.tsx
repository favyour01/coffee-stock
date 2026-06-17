import { requireRole } from "@/lib/auth/session";
import { ReportClient } from "@/components/laporan/report-client";
import { getSupplierStats } from "@/lib/queries/dashboard";

export default async function LaporanSupplierPage() {
  await requireRole(["owner", "admin"]);
  const stats = await getSupplierStats();

  const rows = stats.map((s) => ({
    nama: s.nama,
    transaksi: s.transaction_count,
    total: s.total_pembelian,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Supplier</h1>
        <p className="text-muted-foreground">Rekap pembelian per supplier</p>
      </div>
      <ReportClient
        title="Laporan Supplier"
        columns={[
          { key: "nama", label: "Supplier" },
          { key: "transaksi", label: "Jumlah Transaksi" },
          { key: "total", label: "Total Pembelian" },
        ]}
        data={rows}
        pdfColumns={["Supplier", "Transaksi", "Total Pembelian"]}
        pdfRows={rows.map((r) => [r.nama, r.transaksi, r.total])}
      />
    </div>
  );
}
