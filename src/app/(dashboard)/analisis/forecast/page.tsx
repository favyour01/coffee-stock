import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getForecastData } from "@/lib/queries/dashboard";
import { subMonths, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default async function ForecastPage() {
  await requireRole(["owner", "admin"]);
  const forecasts = await getForecastData();
  const monthLabels = [3, 2, 1].map((i) =>
    format(subMonths(new Date(), i), "MMMM", { locale: idLocale })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Forecast Stok</h1>
        <p className="text-muted-foreground">Prediksi kebutuhan stok menggunakan moving average 3 bulan</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barang</TableHead>
                <TableHead>Stok</TableHead>
                {monthLabels.map((m) => (
                  <TableHead key={m}>{m}</TableHead>
                ))}
                <TableHead>Prediksi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecasts.map((f) => (
                <TableRow key={f.product_id}>
                  <TableCell className="font-medium">{f.nama_barang}</TableCell>
                  <TableCell>{f.stok} {f.satuan}</TableCell>
                  {f.monthly_usage.map((u, i) => (
                    <TableCell key={i}>{u} {f.satuan}</TableCell>
                  ))}
                  <TableCell className="font-medium">{f.forecast} {f.satuan}</TableCell>
                  <TableCell>
                    {f.needs_restock ? (
                      <Badge variant="destructive">Perlu Restock</Badge>
                    ) : (
                      <Badge variant="secondary">Cukup</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {forecasts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Belum ada data produk
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
