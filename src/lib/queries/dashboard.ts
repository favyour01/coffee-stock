import { createClient } from "@/lib/supabase/server";
import type {
  ChartDataPoint,
  DashboardStats,
  ForecastData,
  SupplierStats,
  UsageData,
} from "@/types";
import {
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  eachDayOfInterval,
} from "date-fns";

export async function getLowStockCount(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("stok, minimum_stok");
  return data?.filter((p) => Number(p.stok) < Number(p.minimum_stok)).length ?? 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

  const [productsRes, suppliersRes, stockInRes, stockOutRes] = await Promise.all([
    supabase.from("products").select("stok, harga_beli, minimum_stok"),
    supabase.from("suppliers").select("id", { count: "exact", head: true }),
    supabase
      .from("stock_in")
      .select("qty")
      .gte("tanggal", monthStart)
      .lte("tanggal", monthEnd),
    supabase
      .from("stock_out")
      .select("qty")
      .gte("tanggal", monthStart)
      .lte("tanggal", monthEnd),
  ]);

  const products = productsRes.data ?? [];
  const inventoryValue = products.reduce(
    (sum, p) => sum + Number(p.stok) * Number(p.harga_beli),
    0
  );
  const lowStockCount = products.filter((p) => p.stok < p.minimum_stok).length;

  return {
    totalProducts: products.length,
    totalSuppliers: suppliersRes.count ?? 0,
    stockInThisMonth: stockInRes.data?.reduce((s, r) => s + Number(r.qty), 0) ?? 0,
    stockOutThisMonth: stockOutRes.data?.reduce((s, r) => s + Number(r.qty), 0) ?? 0,
    inventoryValue,
    lowStockCount,
  };
}

export async function getStockInChart(): Promise<ChartDataPoint[]> {
  const supabase = await createClient();
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days = eachDayOfInterval({ start, end });

  const { data } = await supabase
    .from("stock_in")
    .select("qty, tanggal")
    .gte("tanggal", format(start, "yyyy-MM-dd"))
    .lte("tanggal", format(end, "yyyy-MM-dd"));

  return days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const value =
      data
        ?.filter((r) => r.tanggal === dayStr)
        .reduce((s, r) => s + Number(r.qty), 0) ?? 0;
    return { date: format(day, "dd MMM"), value };
  });
}

export async function getStockOutChart(): Promise<ChartDataPoint[]> {
  const supabase = await createClient();
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days = eachDayOfInterval({ start, end });

  const { data } = await supabase
    .from("stock_out")
    .select("qty, tanggal")
    .gte("tanggal", format(start, "yyyy-MM-dd"))
    .lte("tanggal", format(end, "yyyy-MM-dd"));

  return days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const value =
      data
        ?.filter((r) => r.tanggal === dayStr)
        .reduce((s, r) => s + Number(r.qty), 0) ?? 0;
    return { date: format(day, "dd MMM"), value };
  });
}

export async function getTopUsageProducts(): Promise<ChartDataPoint[]> {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");

  const { data: stockOut } = await supabase
    .from("stock_out")
    .select("product_id, qty, products(nama_barang)")
    .gte("tanggal", monthStart);

  const usageMap = new Map<string, { name: string; total: number }>();

  stockOut?.forEach((row) => {
    const product = row.products as unknown as { nama_barang: string } | null;
    const name = product?.nama_barang ?? "Unknown";
    const existing = usageMap.get(row.product_id) ?? { name, total: 0 };
    existing.total += Number(row.qty);
    usageMap.set(row.product_id, existing);
  });

  return Array.from(usageMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((item) => ({ date: item.name, value: item.total }));
}

export async function getLowStockProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(nama)")
    .order("stok", { ascending: true });

  return (data ?? []).filter((p) => p.stok < p.minimum_stok);
}

export async function getUsageAnalysis(): Promise<{
  mostUsed: UsageData[];
  leastUsed: UsageData[];
}> {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");

  const { data: products } = await supabase.from("products").select("id, nama_barang, satuan");
  const { data: stockOut } = await supabase
    .from("stock_out")
    .select("product_id, qty")
    .gte("tanggal", monthStart);

  const usageMap = new Map<string, number>();
  stockOut?.forEach((row) => {
    usageMap.set(row.product_id, (usageMap.get(row.product_id) ?? 0) + Number(row.qty));
  });

  const usageData: UsageData[] = (products ?? []).map((p) => ({
    product_id: p.id,
    nama_barang: p.nama_barang,
    satuan: p.satuan,
    total_usage: usageMap.get(p.id) ?? 0,
  }));

  const sorted = [...usageData].sort((a, b) => b.total_usage - a.total_usage);
  return {
    mostUsed: sorted.filter((u) => u.total_usage > 0).slice(0, 10),
    leastUsed: sorted.filter((u) => u.total_usage > 0).slice(-10).reverse(),
  };
}

export async function getSupplierStats(): Promise<SupplierStats[]> {
  const supabase = await createClient();
  const { data: suppliers } = await supabase.from("suppliers").select("id, nama");
  const { data: stockIn } = await supabase
    .from("stock_in")
    .select("supplier_id, qty, harga_beli");

  return (suppliers ?? []).map((s) => {
    const transactions = stockIn?.filter((si) => si.supplier_id === s.id) ?? [];
    return {
      supplier_id: s.id,
      nama: s.nama,
      transaction_count: transactions.length,
      total_pembelian: transactions.reduce(
        (sum, t) => sum + Number(t.qty) * Number(t.harga_beli),
        0
      ),
    };
  }).sort((a, b) => b.total_pembelian - a.total_pembelian);
}

export async function getForecastData(): Promise<ForecastData[]> {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*");

  const monthlyUsage: ForecastData[] = [];

  for (const product of products ?? []) {
    const months: number[] = [];
    for (let i = 3; i >= 1; i--) {
      const monthDate = subMonths(new Date(), i);
      const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
      const end = format(endOfMonth(monthDate), "yyyy-MM-dd");

      const { data: stockOut } = await supabase
        .from("stock_out")
        .select("qty")
        .eq("product_id", product.id)
        .gte("tanggal", start)
        .lte("tanggal", end);

      const usage = stockOut?.reduce((s, r) => s + Number(r.qty), 0) ?? 0;
      months.push(usage);
    }

    const forecast =
      months.length > 0
        ? months.reduce((a, b) => a + b, 0) / months.length
        : 0;

    monthlyUsage.push({
      product_id: product.id,
      nama_barang: product.nama_barang,
      satuan: product.satuan,
      stok: Number(product.stok),
      minimum_stok: Number(product.minimum_stok),
      monthly_usage: months,
      forecast: Math.round(forecast * 100) / 100,
      needs_restock: Number(product.stok) < forecast,
    });
  }

  return monthlyUsage.sort((a, b) => b.forecast - a.forecast);
}
