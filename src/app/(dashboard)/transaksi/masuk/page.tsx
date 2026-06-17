import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { StockInClient } from "@/components/transaksi/stock-in-client";

export default async function StockInPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();

  const [productsRes, suppliersRes, historyRes] = await Promise.all([
    supabase.from("products").select("*").order("nama_barang"),
    supabase.from("suppliers").select("*").order("nama"),
    supabase
      .from("stock_in")
      .select("*, products(nama_barang), suppliers(nama)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Barang Masuk</h1>
        <p className="text-muted-foreground">Catat barang masuk dari supplier</p>
      </div>
      <StockInClient
        products={productsRes.data ?? []}
        suppliers={suppliersRes.data ?? []}
        history={historyRes.data ?? []}
      />
    </div>
  );
}
