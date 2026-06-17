import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { SatuanClient } from "@/components/master/satuan-client";

export default async function SatuanPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();
  const { data: units } = await supabase.from("units").select("*").order("nama");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Satuan</h1>
        <p className="text-muted-foreground">
          Kelola satuan barang (pcs, Kg, Liter, dll.)
        </p>
      </div>
      <SatuanClient units={units ?? []} />
    </div>
  );
}
