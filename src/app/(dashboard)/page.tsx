import { StatCard, StatCardCurrency } from "@/components/dashboard/stat-card";
import { LineChartCard, BarChartCard } from "@/components/charts/chart-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Package,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import {
  getDashboardStats,
  getStockInChart,
  getStockOutChart,
  getTopUsageProducts,
  getLowStockProducts,
} from "@/lib/queries/dashboard";
import { requireAuth } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import Link from "next/link";

export default async function DashboardPage() {
  const profile = await requireAuth();
  const [stats, stockInChart, stockOutChart, topUsage, lowStock] = await Promise.all([
    getDashboardStats(),
    getStockInChart(),
    getStockOutChart(),
    getTopUsageProducts(),
    getLowStockProducts(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Ringkasan inventaris kedai kopi" />

      <QuickActions role={profile.role} />

      {lowStock.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stok Menipis!</AlertTitle>
          <AlertDescription>
            {lowStock.length} barang perlu segera di-restock.{" "}
            <Link href="/master/barang" className="underline">
              Lihat detail
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Produk" value={stats.totalProducts} icon={Package} />
        <StatCard title="Total Supplier" value={stats.totalSuppliers} icon={Truck} />
        <StatCard title="Barang Masuk" value={stats.stockInThisMonth} icon={ArrowDownToLine} description="Bulan ini" />
        <StatCard title="Barang Keluar" value={stats.stockOutThisMonth} icon={ArrowUpFromLine} description="Bulan ini" />
        <StatCard title="Stok Menipis" value={stats.lowStockCount} icon={AlertTriangle} variant="warning" />
        <StatCardCurrency title="Nilai Inventaris" value={stats.inventoryValue} icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grafik Barang Masuk (per hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartCard data={stockInChart} color="#16a34a" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grafik Barang Keluar (per hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartCard data={stockOutChart} color="#dc2626" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Penggunaan Bahan Terbanyak</CardTitle>
          </CardHeader>
          <CardContent>
            {topUsage.length > 0 ? (
              <BarChartCard data={topUsage} />
            ) : (
              <p className="py-8 text-center text-muted-foreground">Belum ada data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifikasi Stok Menipis</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{product.nama_barang}</p>
                      <p className="text-sm text-muted-foreground">
                        Stok: {product.stok} {product.satuan} | Min: {product.minimum_stok}{" "}
                        {product.satuan}
                      </p>
                    </div>
                    <Badge variant="destructive">Segera Restock</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">Semua stok aman</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
