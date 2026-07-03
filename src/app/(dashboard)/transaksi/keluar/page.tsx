import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { StockOutClient } from "@/components/transaksi/stock-out-client";

export default async function StockOutPage() {
  await requireRole(["owner", "admin", "stok"]);
  const supabase = await createClient();

  const [productsRes, historyRes] = await Promise.all([
    supabase.from("products").select("*").order("nama_barang"),
    supabase
      .from("stock_out")
      .select("*, products(nama_barang)")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Barang Keluar</h1>
        <p className="text-muted-foreground">Catat barang keluar / pemakaian</p>
      </div>
      <StockOutClient products={productsRes.data ?? []} history={historyRes.data ?? []} />
    </div>
  );
}
