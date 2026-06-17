import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { SatuanClient } from "@/components/master/satuan-client";

export default async function SatuanPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();
  const { data: units } = await supabase.from("units").select("*").order("nama");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Satuan"
        description="Kelola satuan barang (pcs, Kg, Liter, dll.)"
      />
      <SatuanClient units={units ?? []} />
    </div>
  );
}
