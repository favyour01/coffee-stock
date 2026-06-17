"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Dari</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div>
          <Label>Sampai</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {typeof row[col.key] === "number" && col.key.includes("harga")
                          ? formatCurrency(row[col.key] as number)
                          : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
