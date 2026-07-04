import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/lib/api";
import { AuditClient } from "@/components/pengaturan/audit-client";
import { PageHeader } from "@/components/layout/page-header";

export function AuditPage() {
  const { data: logs = [] } = useQuery({ queryKey: ["audit-logs"], queryFn: () => auditApi.list() });
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Riwayat aktivitas sistem" />
      <AuditClient logs={logs} />
    </div>
  );
}
