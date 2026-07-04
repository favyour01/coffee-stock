import { DataClient } from "@/components/pengaturan/data-client";
import { PageHeader } from "@/components/layout/page-header";

export function DataPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Kelola Data" description="Atur dan reset data bisnis" />
      <DataClient />
    </div>
  );
}
