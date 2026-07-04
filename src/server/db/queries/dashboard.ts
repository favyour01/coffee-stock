import { query, queryOne } from "../connection";
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from "date-fns";
import type mysql from "mysql2/promise";

function monthRange(offset = 0) {
  const d = offset === 0 ? new Date() : subMonths(new Date(), offset);
  return {
    start: format(startOfMonth(d), "yyyy-MM-dd"),
    end: format(endOfMonth(d), "yyyy-MM-dd"),
  };
}

export async function getDashboardStats() {
  const { start, end } = monthRange();

  const [products, supplierCount, stockInSum, stockOutSum] = await Promise.all([
    query<mysql.RowDataPacket & { stok: number; harga_beli: number; minimum_stok: number }>(
      "SELECT stok, harga_beli, minimum_stok FROM products"
    ),
    queryOne<mysql.RowDataPacket & { cnt: number }>(
      "SELECT COUNT(*) AS cnt FROM suppliers"
    ),
    queryOne<mysql.RowDataPacket & { total: number }>(
      "SELECT COALESCE(SUM(qty), 0) AS total FROM stock_in WHERE tanggal BETWEEN ? AND ?",
      [start, end]
    ),
    queryOne<mysql.RowDataPacket & { total: number }>(
      "SELECT COALESCE(SUM(qty), 0) AS total FROM stock_out WHERE tanggal BETWEEN ? AND ?",
      [start, end]
    ),
  ]);

  const inventoryValue = products.reduce((s, p) => s + Number(p.stok) * Number(p.harga_beli), 0);
  const lowStockCount = products.filter((p) => Number(p.stok) < Number(p.minimum_stok)).length;

  return {
    totalProducts: products.length,
    totalSuppliers: supplierCount?.cnt ?? 0,
    stockInThisMonth: Number(stockInSum?.total ?? 0),
    stockOutThisMonth: Number(stockOutSum?.total ?? 0),
    inventoryValue,
    lowStockCount,
  };
}

export async function getStockInChart() {
  const { start, end } = monthRange();
  const rows = await query<mysql.RowDataPacket & { tanggal: string; total: number }>(
    "SELECT tanggal, SUM(qty) AS total FROM stock_in WHERE tanggal BETWEEN ? AND ? GROUP BY tanggal",
    [start, end]
  );
  const map = new Map(rows.map((r) => [r.tanggal, Number(r.total)]));
  const days = eachDayOfInterval({ start: new Date(start), end: new Date(end) });
  return days.map((d) => ({ date: format(d, "dd MMM"), value: map.get(format(d, "yyyy-MM-dd")) ?? 0 }));
}

export async function getStockOutChart() {
  const { start, end } = monthRange();
  const rows = await query<mysql.RowDataPacket & { tanggal: string; total: number }>(
    "SELECT tanggal, SUM(qty) AS total FROM stock_out WHERE tanggal BETWEEN ? AND ? GROUP BY tanggal",
    [start, end]
  );
  const map = new Map(rows.map((r) => [r.tanggal, Number(r.total)]));
  const days = eachDayOfInterval({ start: new Date(start), end: new Date(end) });
  return days.map((d) => ({ date: format(d, "dd MMM"), value: map.get(format(d, "yyyy-MM-dd")) ?? 0 }));
}

export async function getTopUsage() {
  const { start } = monthRange();
  const rows = await query<mysql.RowDataPacket & { nama_barang: string; total: number }>(
    `SELECT p.nama_barang, SUM(so.qty) AS total
     FROM stock_out so JOIN products p ON so.product_id = p.id
     WHERE so.tanggal >= ? GROUP BY so.product_id, p.nama_barang
     ORDER BY total DESC LIMIT 5`,
    [start]
  );
  return rows.map((r) => ({ date: r.nama_barang, value: Number(r.total) }));
}

export async function getLowStockProducts() {
  return query<mysql.RowDataPacket>(
    `SELECT p.*, c.nama AS kategori_nama FROM products p
     LEFT JOIN categories c ON p.kategori_id = c.id
     WHERE p.stok < p.minimum_stok ORDER BY p.stok ASC`
  );
}

export async function getUsageAnalysis() {
  const { start } = monthRange();
  const products = await query<mysql.RowDataPacket & { id: string; nama_barang: string; satuan: string }>(
    "SELECT id, nama_barang, satuan FROM products"
  );
  const usageRows = await query<mysql.RowDataPacket & { product_id: string; total: number }>(
    "SELECT product_id, SUM(qty) AS total FROM stock_out WHERE tanggal >= ? GROUP BY product_id",
    [start]
  );
  const usageMap = new Map(usageRows.map((r) => [r.product_id, Number(r.total)]));
  const data = products.map((p) => ({
    product_id: p.id, nama_barang: p.nama_barang, satuan: p.satuan,
    total_usage: usageMap.get(p.id) ?? 0,
  })).sort((a, b) => b.total_usage - a.total_usage);

  return {
    mostUsed: data.filter((u) => u.total_usage > 0).slice(0, 10),
    leastUsed: data.filter((u) => u.total_usage > 0).slice(-10).reverse(),
  };
}

export async function getSupplierStats() {
  return query<mysql.RowDataPacket>(
    `SELECT s.id AS supplier_id, s.nama,
       COUNT(si.id) AS transaction_count,
       COALESCE(SUM(si.qty * si.harga_beli), 0) AS total_pembelian
     FROM suppliers s LEFT JOIN stock_in si ON s.id = si.supplier_id
     GROUP BY s.id, s.nama ORDER BY total_pembelian DESC`
  );
}

export async function getForecastData() {
  const products = await query<mysql.RowDataPacket & {
    id: string; nama_barang: string; satuan: string; stok: number; minimum_stok: number;
  }>("SELECT id, nama_barang, satuan, stok, minimum_stok FROM products");

  const result = await Promise.all(
    products.map(async (p) => {
      const months = await Promise.all(
        [3, 2, 1].map(async (offset) => {
          const { start, end } = monthRange(offset);
          const row = await queryOne<mysql.RowDataPacket & { total: number }>(
            "SELECT COALESCE(SUM(qty), 0) AS total FROM stock_out WHERE product_id = ? AND tanggal BETWEEN ? AND ?",
            [p.id, start, end]
          );
          return Number(row?.total ?? 0);
        })
      );
      const forecast = months.length ? months.reduce((a, b) => a + b, 0) / months.length : 0;
      return {
        product_id: p.id, nama_barang: p.nama_barang, satuan: p.satuan,
        stok: Number(p.stok), minimum_stok: Number(p.minimum_stok),
        monthly_usage: months, forecast: Math.round(forecast * 100) / 100,
        needs_restock: Number(p.stok) < forecast,
      };
    })
  );
  return result.sort((a, b) => b.forecast - a.forecast);
}

export async function getAuditLogs(limit = 200) {
  return query<mysql.RowDataPacket>(
    `SELECT al.*, u.nama AS user_nama FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ORDER BY al.created_at DESC LIMIT ?`,
    [limit]
  );
}

export async function addAuditLog(
  id: string,
  userId: string | null,
  action: string,
  tableName: string,
  recordId: string | null,
  oldData: unknown,
  newData: unknown
) {
  const { execute } = await import("../connection");
  return execute(
    "INSERT INTO audit_logs (id, user_id, action, table_name, record_id, old_data, new_data) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, userId, action, tableName, recordId,
     oldData ? JSON.stringify(oldData) : null,
     newData ? JSON.stringify(newData) : null]
  );
}
