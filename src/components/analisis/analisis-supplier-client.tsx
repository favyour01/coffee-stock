"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import type { SupplierStats } from "@/types";

export function AnalisisSupplierClient({ stats }: { stats: SupplierStats[] }) {
  const columns = useMemo<DataTableColumn<SupplierStats>[]>(
    () => [
      {
        id: "supplier",
        header: "Supplier",
        sortable: true,
        sortValue: (s) => s.nama,
        cell: (s) => {
          const idx = stats.findIndex((x) => x.supplier_id === s.supplier_id);
          return (
            <span className="font-medium">
              {s.nama}
              {idx === 0 && s.transaction_count > 0 && (
                <Badge className="ml-2" variant="secondary">Teraktif</Badge>
              )}
            </span>
          );
        },
      },
      { id: "transaksi", header: "Jumlah Transaksi", sortable: true, sortValue: (s) => s.transaction_count, cell: (s) => s.transaction_count },
      { id: "total", header: "Total Pembelian", sortable: true, sortValue: (s) => s.total_pembelian, cell: (s) => formatCurrency(s.total_pembelian) },
    ],
    [stats]
  );

  return (
    <DataTable
      data={stats}
      columns={columns}
      getRowKey={(s) => s.supplier_id}
      searchPlaceholder="Cari supplier..."
      searchFilter={(s, q) => s.nama.toLowerCase().includes(q)}
      emptyMessage="Belum ada data supplier"
    />
  );
}
