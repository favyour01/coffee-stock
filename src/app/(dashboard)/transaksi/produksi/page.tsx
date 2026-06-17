import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ProduksiClient } from "@/components/transaksi/produksi-client";

export default async function ProduksiPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();

  const [recipesRes, productsRes] = await Promise.all([
    supabase
      .from("recipes")
      .select("*, recipe_items(*, products(nama_barang, satuan))")
      .order("nama_menu"),
    supabase.from("products").select("*").order("nama_barang"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Produksi</h1>
        <p className="text-muted-foreground">Kelola resep produk kopi</p>
      </div>
      <ProduksiClient recipes={recipesRes.data ?? []} products={productsRes.data ?? []} />
    </div>
  );
}
