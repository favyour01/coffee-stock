import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { RiwayatClient } from "@/components/transaksi/riwayat-client";
import type { TransactionHistory } from "@/types";

export default async function RiwayatPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();

  const [stockInRes, stockOutRes, salesRes] = await Promise.all([
    supabase
      .from("stock_in")
      .select("id, qty, tanggal, products(nama_barang), profiles(nama)")
      .order("tanggal", { ascending: false }),
    supabase
      .from("stock_out")
      .select("id, qty, tanggal, keterangan, products(nama_barang), profiles(nama)")
      .order("tanggal", { ascending: false }),
    supabase
      .from("sales")
      .select("id, qty, tanggal, recipes(nama_menu), profiles(nama)")
      .order("tanggal", { ascending: false }),
  ]);

  const transactions: TransactionHistory[] = [
    ...(stockInRes.data?.map((s) => ({
      id: s.id,
      type: "stock_in" as const,
      tanggal: s.tanggal,
      description: (s.products as unknown as { nama_barang: string })?.nama_barang ?? "",
      qty: Number(s.qty),
      user_name: (s.profiles as unknown as { nama: string })?.nama ?? "",
    })) ?? []),
    ...(stockOutRes.data?.map((s) => ({
      id: s.id,
      type: "stock_out" as const,
      tanggal: s.tanggal,
      description: `${(s.products as unknown as { nama_barang: string })?.nama_barang ?? ""} — ${s.keterangan ?? ""}`,
      qty: Number(s.qty),
      user_name: (s.profiles as unknown as { nama: string })?.nama ?? "",
    })) ?? []),
    ...(salesRes.data?.map((s) => ({
      id: s.id,
      type: "sale" as const,
      tanggal: s.tanggal,
      description: (s.recipes as unknown as { nama_menu: string })?.nama_menu ?? "",
      qty: Number(s.qty),
      user_name: (s.profiles as unknown as { nama: string })?.nama ?? "",
    })) ?? []),
  ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        <p className="text-muted-foreground">Semua transaksi masuk, keluar, dan penjualan</p>
      </div>
      <RiwayatClient transactions={transactions} />
    </div>
  );
}
