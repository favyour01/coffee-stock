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
import { formatDate } from "@/lib/utils";
import type { AuditLog } from "@/types";

type AuditLogRow = AuditLog & {
  profiles?: { nama: string } | null;
};

export function AuditClient({ logs }: { logs: AuditLogRow[] }) {
  const [filterAction, setFilterAction] = useState("all");

  const tableData = useMemo(() => {
    if (filterAction === "all") return logs;
    return logs.filter((l) => l.action === filterAction);
  }, [logs, filterAction]);

  const columns = useMemo<DataTableColumn<AuditLogRow>[]>(
    () => [
      { id: "waktu", header: "Waktu", sortable: true, sortValue: (l) => l.created_at, cell: (l) => formatDate(l.created_at) },
      { id: "user", header: "User", sortable: true, sortValue: (l) => l.profiles?.nama ?? "", cell: (l) => l.profiles?.nama ?? "System" },
      {
        id: "aksi",
        header: "Aksi",
        sortable: true,
        sortValue: (l) => l.action,
        cell: (l) => (
          <Badge variant={l.action === "DELETE" ? "destructive" : "secondary"}>{l.action}</Badge>
        ),
      },
      { id: "tabel", header: "Tabel", sortable: true, sortValue: (l) => l.table_name, cell: (l) => l.table_name },
      { id: "record", header: "Record ID", cell: (l) => <span className="font-mono text-xs">{l.record_id?.slice(0, 8) ?? "-"}...</span> },
    ],
    []
  );

  return (
    <DataTable
      data={tableData}
      columns={columns}
      getRowKey={(l) => l.id}
      searchPlaceholder="Cari user, tabel, atau aksi..."
      searchFilter={(l, q) =>
        (l.profiles?.nama ?? "").toLowerCase().includes(q) ||
        l.table_name.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      }
      emptyMessage="Belum ada log aktivitas"
      filters={
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Aksi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            <SelectItem value="INSERT">INSERT</SelectItem>
            <SelectItem value="UPDATE">UPDATE</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      }
    />
  );
}
