import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsageAnalysis } from "@/lib/queries/dashboard";
import { requireRole } from "@/lib/auth/session";

export default async function PenggunaanPage() {
  await requireRole(["owner", "admin"]);
  const { mostUsed, leastUsed } = await getUsageAnalysis();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analisis Penggunaan Barang</h1>
        <p className="text-muted-foreground">Barang paling banyak dan paling jarang digunakan bulan ini</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Paling Banyak Digunakan</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead>Penggunaan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mostUsed.map((u) => (
                  <TableRow key={u.product_id}>
                    <TableCell>{u.nama_barang}</TableCell>
                    <TableCell>{u.total_usage} {u.satuan}</TableCell>
                  </TableRow>
                ))}
                {mostUsed.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Belum ada data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Paling Jarang Digunakan</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead>Penggunaan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leastUsed.map((u) => (
                  <TableRow key={u.product_id}>
                    <TableCell>{u.nama_barang}</TableCell>
                    <TableCell>{u.total_usage} {u.satuan}</TableCell>
                  </TableRow>
                ))}
                {leastUsed.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Belum ada data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
