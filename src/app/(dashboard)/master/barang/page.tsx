import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { BarangClient } from "@/components/master/barang-client";

export default async function BarangPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const [productsRes, categoriesRes, suppliersRes, unitsRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(nama), suppliers(nama)")
      .order("nama_barang"),
    supabase.from("categories").select("*").order("nama"),
    supabase.from("suppliers").select("*").order("nama"),
    supabase.from("units").select("*").order("nama"),
  ]);

  const canEdit = profile.role === "owner" || profile.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Barang</h1>
        <p className="text-muted-foreground">Kelola data barang dan stok</p>
      </div>
      <BarangClient
        products={productsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        suppliers={suppliersRes.data ?? []}
        units={unitsRes.data ?? []}
        canEdit={canEdit}
      />
    </div>
  );
}
