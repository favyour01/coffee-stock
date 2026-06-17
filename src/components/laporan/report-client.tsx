"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel } from "@/lib/export/excel";
import { exportToPdf } from "@/lib/export/pdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface ReportRow {
  [key: string]: string | number;
}

interface ReportClientProps {
  title: string;
  columns: { key: string; label: string }[];
  data: ReportRow[];
  pdfColumns: string[];
  pdfRows: (string | number)[][];
}

export function ReportClient({
  title,
  columns,
  data,
  pdfColumns,
  pdfRows,
}: ReportClientProps) {
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const period = `${formatDate(dateFrom)} — ${formatDate(dateTo)}`;

  const tableColumns = useMemo<DataTableColumn<ReportRow>[]>(
    () =>
      columns.map((col) => ({
        id: col.key,
        header: col.label,
        sortable: true,
        sortValue: (row) => row[col.key] ?? "",
        cell: (row) =>
          typeof row[col.key] === "number" && col.key.includes("harga")
            ? formatCurrency(row[col.key] as number)
            : row[col.key],
      })),
    [columns]
  );

  const handleExportExcel = () => {
    exportToExcel(data, `laporan-${title.toLowerCase().replace(/\s/g, "-")}`, title);
  };

  const handleExportPdf = () => {
    exportToPdf({
      title,
      period,
      columns: pdfColumns,
      rows: pdfRows,
      filename: `laporan-${title.toLowerCase().replace(/\s/g, "-")}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-5">
        <Field label="Dari" className="min-w-[180px]">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </Field>
        <Field label="Sampai" className="min-w-[180px]">
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </Field>
        <Button variant="outline" onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />Export Excel
        </Button>
        <Button variant="outline" onClick={handleExportPdf}>
          <FileText className="mr-2 h-4 w-4" />Export PDF
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            data={data}
            columns={tableColumns}
            getRowKey={(row) => columns.map((c) => String(row[c.key] ?? "")).join("-") || JSON.stringify(row)}
            searchPlaceholder="Cari data laporan..."
            emptyMessage="Tidak ada data"
          />
        </CardContent>
      </Card>
    </div>
  );
}
