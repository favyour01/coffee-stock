import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ReportClient } from "@/components/laporan/report-client";

export default async function LaporanStokPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*, categories(nama)")
    .order("nama_barang");

  const rows = (data ?? []).map((p) => ({
    kode: p.kode_barang,
    nama: p.nama_barang,
    kategori: (p.categories as unknown as { nama: string })?.nama ?? "-",
    stok: Number(p.stok),
    satuan: p.satuan,
    minimum: Number(p.minimum_stok),
    harga_beli: Number(p.harga_beli),
    nilai: Number(p.stok) * Number(p.harga_beli),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Persediaan</h1>
        <p className="text-muted-foreground">Snapshot stok barang saat ini</p>
      </div>
      <ReportClient
        title="Laporan Persediaan"
        columns={[
          { key: "kode", label: "Kode" },
          { key: "nama", label: "Nama" },
          { key: "kategori", label: "Kategori" },
          { key: "stok", label: "Stok" },
          { key: "satuan", label: "Satuan" },
          { key: "minimum", label: "Min. Stok" },
          { key: "nilai", label: "Nilai" },
        ]}
        data={rows}
        pdfColumns={["Kode", "Nama", "Kategori", "Stok", "Satuan", "Min", "Nilai"]}
        pdfRows={rows.map((r) => [r.kode, r.nama, r.kategori, r.stok, r.satuan, r.minimum, r.nilai])}
      />
    </div>
  );
}
