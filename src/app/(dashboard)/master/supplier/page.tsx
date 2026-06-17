import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { SupplierClient } from "@/components/master/supplier-client";

export default async function SupplierPage() {
  await requireRole(["owner", "admin"]);
  const supabase = await createClient();
  const { data: suppliers } = await supabase.from("suppliers").select("*").order("nama");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Supplier</h1>
        <p className="text-muted-foreground">Kelola data supplier</p>
      </div>
      <SupplierClient suppliers={suppliers ?? []} />
    </div>
  );
}
