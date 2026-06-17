"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { ForecastData } from "@/types";

export function ForecastClient({
  forecasts,
  monthLabels,
}: {
  forecasts: ForecastData[];
  monthLabels: string[];
}) {
  const [filterStatus, setFilterStatus] = useState("all");

  const tableData = useMemo(() => {
    if (filterStatus === "all") return forecasts;
    if (filterStatus === "restock") return forecasts.filter((f) => f.needs_restock);
    return forecasts.filter((f) => !f.needs_restock);
  }, [forecasts, filterStatus]);

  const columns = useMemo<DataTableColumn<ForecastData>[]>(() => {
    const cols: DataTableColumn<ForecastData>[] = [
      { id: "barang", header: "Barang", sortable: true, sortValue: (f) => f.nama_barang, cell: (f) => <span className="font-medium">{f.nama_barang}</span> },
      { id: "stok", header: "Stok", sortable: true, sortValue: (f) => f.stok, cell: (f) => `${f.stok} ${f.satuan}` },
    ];

    monthLabels.forEach((label, i) => {
      cols.push({
        id: `month-${i}`,
        header: label,
        sortable: true,
        sortValue: (f) => f.monthly_usage[i] ?? 0,
        cell: (f) => `${f.monthly_usage[i] ?? 0} ${f.satuan}`,
      });
    });

    cols.push(
      { id: "prediksi", header: "Prediksi", sortable: true, sortValue: (f) => f.forecast, cell: (f) => <span className="font-medium">{f.forecast} {f.satuan}</span> },
      {
        id: "status",
        header: "Status",
        cell: (f) =>
          f.needs_restock ? (
            <Badge variant="destructive">Perlu Restock</Badge>
          ) : (
            <Badge variant="secondary">Cukup</Badge>
          ),
      }
    );

    return cols;
  }, [monthLabels]);

  return (
    <DataTable
      data={tableData}
      columns={columns}
      getRowKey={(f) => f.product_id}
      searchPlaceholder="Cari barang..."
      searchFilter={(f, q) => f.nama_barang.toLowerCase().includes(q)}
      emptyMessage="Belum ada data produk"
      filters={
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="restock">Perlu Restock</SelectItem>
            <SelectItem value="cukup">Stok Cukup</SelectItem>
          </SelectContent>
        </Select>
      }
    />
  );
}
