import { requireRole } from "@/lib/auth/session";
import { ReportClient } from "@/components/laporan/report-client";
import { getUsageAnalysis } from "@/lib/queries/dashboard";

export default async function LaporanPenggunaanPage() {
  await requireRole(["owner", "admin"]);
  const { mostUsed } = await getUsageAnalysis();

  const rows = mostUsed.map((u) => ({
    barang: u.nama_barang,
    penggunaan: u.total_usage,
    satuan: u.satuan,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Penggunaan Bahan</h1>
        <p className="text-muted-foreground">Rekap penggunaan bahan bulan ini</p>
      </div>
      <ReportClient
        title="Laporan Penggunaan Bahan"
        columns={[
          { key: "barang", label: "Barang" },
          { key: "penggunaan", label: "Penggunaan" },
          { key: "satuan", label: "Satuan" },
        ]}
        data={rows}
        pdfColumns={["Barang", "Penggunaan", "Satuan"]}
        pdfRows={rows.map((r) => [r.barang, r.penggunaan, r.satuan])}
      />
    </div>
  );
}
