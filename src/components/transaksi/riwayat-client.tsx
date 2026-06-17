"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const filtered = transactions.filter((t) =>
    isWithinInterval(parseISO(t.tanggal), { start, end })
  );

  const typeLabel = (type: string) => {
    switch (type) {
      case "stock_in": return <Badge className="bg-green-600">Masuk</Badge>;
      case "stock_out": return <Badge variant="destructive">Keluar</Badge>;
      case "sale": return <Badge className="bg-blue-600">Penjualan</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
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
        <div className="flex gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={`${t.type}-${t.id}`}>
                <TableCell>{formatDate(t.tanggal)}</TableCell>
                <TableCell>{typeLabel(t.type)}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell>{t.qty}</TableCell>
                <TableCell>{t.user_name}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada transaksi pada periode ini
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
