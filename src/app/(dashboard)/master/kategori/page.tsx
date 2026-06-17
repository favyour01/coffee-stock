import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { KategoriClient } from "@/components/master/kategori-client";

export default async function KategoriPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("nama");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kategori</h1>
        <p className="text-muted-foreground">Kelola kategori barang</p>
      </div>
      <KategoriClient categories={categories ?? []} />
    </div>
  );
}
