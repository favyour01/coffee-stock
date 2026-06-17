import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ReportClient } from "@/components/laporan/report-client";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default async function LaporanKeluarPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();
  const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const end = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data } = await supabase
    .from("stock_out")
    .select("*, products(nama_barang, satuan)")
    .gte("tanggal", start)
    .lte("tanggal", end)
    .order("tanggal", { ascending: false });

  const rows = (data ?? []).map((s) => ({
    tanggal: s.tanggal,
    barang: (s.products as unknown as { nama_barang: string })?.nama_barang ?? "",
    qty: Number(s.qty),
    satuan: (s.products as unknown as { satuan: string })?.satuan ?? "",
    keterangan: s.keterangan ?? "-",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Barang Keluar</h1>
        <p className="text-muted-foreground">Rekap barang keluar per periode</p>
      </div>
      <ReportClient
        title="Laporan Barang Keluar"
        columns={[
          { key: "tanggal", label: "Tanggal" },
          { key: "barang", label: "Barang" },
          { key: "qty", label: "Qty" },
          { key: "satuan", label: "Satuan" },
          { key: "keterangan", label: "Keterangan" },
        ]}
        data={rows}
        pdfColumns={["Tanggal", "Barang", "Qty", "Satuan", "Keterangan"]}
        pdfRows={rows.map((r) => [r.tanggal, r.barang, r.qty, r.satuan, r.keterangan])}
      />
    </div>
  );
}
