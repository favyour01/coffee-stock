import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupplierStats } from "@/lib/queries/dashboard";
import { formatCurrency } from "@/lib/utils";
import { requireRole } from "@/lib/auth/session";

export default async function AnalisisSupplierPage() {
  await requireRole(["owner", "admin"]);
  const stats = await getSupplierStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analisis Supplier</h1>
        <p className="text-muted-foreground">Supplier teraktif berdasarkan transaksi pembelian</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Supplier Teraktif</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Jumlah Transaksi</TableHead>
                <TableHead>Total Pembelian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((s, idx) => (
                <TableRow key={s.supplier_id}>
                  <TableCell className="font-medium">
                    {s.nama}
                    {idx === 0 && s.transaction_count > 0 && (
                      <Badge className="ml-2" variant="secondary">Teraktif</Badge>
                    )}
                  </TableCell>
                  <TableCell>{s.transaction_count}</TableCell>
                  <TableCell>{formatCurrency(s.total_pembelian)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
