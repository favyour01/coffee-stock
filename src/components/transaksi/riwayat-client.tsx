"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Field } from "@/components/ui/field";
import { formatDate } from "@/lib/utils";
import type { TransactionHistory } from "@/types";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
} from "date-fns";

export function RiwayatClient({ transactions }: { transactions: TransactionHistory[] }) {
  const [filter, setFilter] = useState("bulanan");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterType, setFilterType] = useState("all");

  const getDateRange = () => {
    const now = new Date();
    switch (filter) {
      case "harian":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "mingguan":
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case "bulanan":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "tahunan":
        return { start: startOfYear(now), end: endOfYear(now) };
      case "custom":
        return {
          start: dateFrom ? parseISO(dateFrom) : startOfMonth(now),
          end: dateTo ? parseISO(dateTo) : endOfMonth(now),
        };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange();

  const tableData = useMemo(() => {
    return transactions.filter((t) => {
      const inRange = isWithinInterval(parseISO(t.tanggal), { start, end });
      const matchType = filterType === "all" || t.type === filterType;
      return inRange && matchType;
    });
  }, [transactions, start, end, filterType]);

  const typeLabel = (type: string) => {
    switch (type) {
      case "stock_in": return <Badge className="bg-green-600">Masuk</Badge>;
      case "stock_out": return <Badge variant="destructive">Keluar</Badge>;
      case "sale": return <Badge className="bg-blue-600">Penjualan</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const columns = useMemo<DataTableColumn<TransactionHistory>[]>(
    () => [
      { id: "tanggal", header: "Tanggal", sortable: true, sortValue: (t) => t.tanggal, cell: (t) => formatDate(t.tanggal) },
      { id: "tipe", header: "Tipe", sortable: true, sortValue: (t) => t.type, cell: (t) => typeLabel(t.type) },
      { id: "deskripsi", header: "Deskripsi", sortable: true, sortValue: (t) => t.description, cell: (t) => t.description },
      { id: "qty", header: "Qty", sortable: true, sortValue: (t) => t.qty, cell: (t) => t.qty },
      { id: "user", header: "User", sortable: true, sortValue: (t) => t.user_name, cell: (t) => t.user_name },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="harian">Harian</TabsTrigger>
          <TabsTrigger value="mingguan">Mingguan</TabsTrigger>
          <TabsTrigger value="bulanan">Bulanan</TabsTrigger>
          <TabsTrigger value="tahunan">Tahunan</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>

      {filter === "custom" && (
        <div className="flex flex-wrap gap-4">
          <Field label="Dari" className="min-w-[180px]">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </Field>
          <Field label="Sampai" className="min-w-[180px]">
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </Field>
        </div>
      )}

      <DataTable
        data={tableData}
        columns={columns}
        getRowKey={(t) => `${t.type}-${t.id}`}
        searchPlaceholder="Cari deskripsi atau user..."
        searchFilter={(t, q) =>
          t.description.toLowerCase().includes(q) ||
          t.user_name.toLowerCase().includes(q)
        }
        emptyMessage="Tidak ada transaksi pada periode ini"
        filters={
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="stock_in">Barang Masuk</SelectItem>
              <SelectItem value="stock_out">Barang Keluar</SelectItem>
              <SelectItem value="sale">Penjualan</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
