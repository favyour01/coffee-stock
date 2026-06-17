import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { AuditClient } from "@/components/pengaturan/audit-client";
import { Card, CardContent } from "@/components/ui/card";

export default async function AuditLogPage() {
  await requireRole(["owner"]);
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, profiles(nama)")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Riwayat aktivitas sistem" />
      <Card>
        <CardContent className="pt-6">
          <AuditClient logs={logs ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
