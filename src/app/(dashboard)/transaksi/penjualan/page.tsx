import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { PenjualanClient } from "@/components/transaksi/penjualan-client";

export default async function PenjualanPage() {
  await requireAuth();
  const supabase = await createClient();

  const [recipesRes, historyRes] = await Promise.all([
    supabase
      .from("recipes")
      .select("*, recipe_items(*, products(nama_barang, satuan))")
      .order("nama_menu"),
    supabase
      .from("sales")
      .select("*, recipes(nama_menu)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Penjualan</h1>
        <p className="text-muted-foreground">Catat penjualan — stok bahan otomatis berkurang</p>
      </div>
      <PenjualanClient recipes={recipesRes.data ?? []} history={historyRes.data ?? []} />
    </div>
  );
}
