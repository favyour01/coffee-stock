import { useQuery } from "@tanstack/react-query";
import { supplierApi } from "@/lib/api";
import { SupplierClient } from "@/components/master/supplier-client";
import { PageHeader } from "@/components/layout/page-header";

export function SupplierPage() {
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: supplierApi.list });
  return (
    <div className="space-y-6">
      <PageHeader title="Supplier" description="Kelola data supplier" />
      <SupplierClient suppliers={suppliers} />
    </div>
  );
}
