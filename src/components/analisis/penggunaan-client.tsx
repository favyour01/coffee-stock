"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { UsageData } from "@/types";

function UsageTable({ title, data }: { title: string; data: UsageData[] }) {
  const columns = useMemo<DataTableColumn<UsageData>[]>(
    () => [
      { id: "barang", header: "Barang", sortable: true, sortValue: (u) => u.nama_barang, cell: (u) => u.nama_barang },
      { id: "penggunaan", header: "Penggunaan", sortable: true, sortValue: (u) => u.total_usage, cell: (u) => `${u.total_usage} ${u.satuan}` },
    ],
    []
  );

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(u) => u.product_id}
          searchPlaceholder="Cari barang..."
          searchFilter={(u, q) => u.nama_barang.toLowerCase().includes(q)}
          emptyMessage="Belum ada data"
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 20]}
        />
      </CardContent>
    </Card>
  );
}

export function PenggunaanClient({
  mostUsed,
  leastUsed,
}: {
  mostUsed: UsageData[];
  leastUsed: UsageData[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <UsageTable title="Paling Banyak Digunakan" data={mostUsed} />
      <UsageTable title="Paling Jarang Digunakan" data={leastUsed} />
    </div>
  );
}
