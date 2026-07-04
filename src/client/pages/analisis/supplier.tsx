import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { AnalisisSupplierClient } from "@/components/analisis/analisis-supplier-client";
import { PageHeader } from "@/components/layout/page-header";

export function AnalisisSupplierPage() {
  const { data = [] } = useQuery({ queryKey: ["analytics", "suppliers"], queryFn: analyticsApi.suppliers });
  return (
    <div className="space-y-6">
      <PageHeader title="Analisis Supplier" description="Statistik performa supplier" />
      <AnalisisSupplierClient data={data} />
    </div>
  );
}
