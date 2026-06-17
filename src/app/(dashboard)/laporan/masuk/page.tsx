import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ReportClient } from "@/components/laporan/report-client";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default async function LaporanMasukPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();
  const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const end = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data } = await supabase
    .from("stock_in")
    .select("*, products(nama_barang, satuan), suppliers(nama)")
    .gte("tanggal", start)
    .lte("tanggal", end)
    .order("tanggal", { ascending: false });

  const rows = (data ?? []).map((s) => ({
    tanggal: s.tanggal,
    barang: (s.products as unknown as { nama_barang: string })?.nama_barang ?? "",
    supplier: (s.suppliers as unknown as { nama: string })?.nama ?? "",
    qty: Number(s.qty),
    harga_beli: Number(s.harga_beli),
    total: Number(s.qty) * Number(s.harga_beli),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Barang Masuk</h1>
        <p className="text-muted-foreground">Rekap barang masuk per periode</p>
      </div>
      <ReportClient
        title="Laporan Barang Masuk"
        columns={[
          { key: "tanggal", label: "Tanggal" },
          { key: "barang", label: "Barang" },
          { key: "supplier", label: "Supplier" },
          { key: "qty", label: "Qty" },
          { key: "harga_beli", label: "Harga Beli" },
          { key: "total", label: "Total" },
        ]}
        data={rows}
        pdfColumns={["Tanggal", "Barang", "Supplier", "Qty", "Harga Beli", "Total"]}
        pdfRows={rows.map((r) => [r.tanggal, r.barang, r.supplier, r.qty, r.harga_beli, r.total])}
      />
    </div>
  );
}
