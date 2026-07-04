import { query, queryOne, execute } from "../connection";
import type mysql from "mysql2/promise";

export interface StockInRow extends mysql.RowDataPacket {
  id: string; product_id: string; supplier_id: string; qty: number;
  harga_beli: number; tanggal: string; user_id: string; created_at: string;
  product_nama?: string; supplier_nama?: string; user_nama?: string;
}
export interface StockOutRow extends mysql.RowDataPacket {
  id: string; product_id: string; qty: number; tanggal: string;
  keterangan: string | null; user_id: string; created_at: string;
  product_nama?: string; user_nama?: string;
}

export const stockInQueries = {
  findAll: (limit = 200) =>
    query<StockInRow>(
      `SELECT si.*, p.nama_barang AS product_nama, s.nama AS supplier_nama, u.nama AS user_nama
       FROM stock_in si
       JOIN products p ON si.product_id = p.id
       JOIN suppliers s ON si.supplier_id = s.id
       JOIN users u ON si.user_id = u.id
       ORDER BY si.created_at DESC LIMIT ?`,
      [limit]
    ),

  findByDateRange: (start: string, end: string) =>
    query<StockInRow>(
      `SELECT si.*, p.nama_barang AS product_nama, s.nama AS supplier_nama, u.nama AS user_nama
       FROM stock_in si
       JOIN products p ON si.product_id = p.id
       JOIN suppliers s ON si.supplier_id = s.id
       JOIN users u ON si.user_id = u.id
       WHERE si.tanggal BETWEEN ? AND ?
       ORDER BY si.tanggal DESC`,
      [start, end]
    ),

  create: (id: string, data: {
    product_id: string; supplier_id: string; qty: number;
    harga_beli: number; tanggal: string; user_id: string;
  }) =>
    execute(
      "INSERT INTO stock_in (id, product_id, supplier_id, qty, harga_beli, tanggal, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, data.product_id, data.supplier_id, data.qty, data.harga_beli, data.tanggal, data.user_id]
    ),

  sumQtyByMonth: (monthStart: string, monthEnd: string) =>
    queryOne<mysql.RowDataPacket & { total: number }>(
      "SELECT COALESCE(SUM(qty), 0) AS total FROM stock_in WHERE tanggal BETWEEN ? AND ?",
      [monthStart, monthEnd]
    ),

  dailyChart: (monthStart: string, monthEnd: string) =>
    query<mysql.RowDataPacket & { tanggal: string; total: number }>(
      `SELECT tanggal, SUM(qty) AS total FROM stock_in
       WHERE tanggal BETWEEN ? AND ? GROUP BY tanggal ORDER BY tanggal`,
      [monthStart, monthEnd]
    ),
};

export const stockOutQueries = {
  findAll: (limit = 200) =>
    query<StockOutRow>(
      `SELECT so.*, p.nama_barang AS product_nama, u.nama AS user_nama
       FROM stock_out so
       JOIN products p ON so.product_id = p.id
       JOIN users u ON so.user_id = u.id
       ORDER BY so.created_at DESC LIMIT ?`,
      [limit]
    ),

  findByDateRange: (start: string, end: string) =>
    query<StockOutRow>(
      `SELECT so.*, p.nama_barang AS product_nama, u.nama AS user_nama
       FROM stock_out so
       JOIN products p ON so.product_id = p.id
       JOIN users u ON so.user_id = u.id
       WHERE so.tanggal BETWEEN ? AND ?
       ORDER BY so.tanggal DESC`,
      [start, end]
    ),

  create: (id: string, data: {
    product_id: string; qty: number; tanggal: string;
    keterangan?: string; user_id: string;
  }) =>
    execute(
      "INSERT INTO stock_out (id, product_id, qty, tanggal, keterangan, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [id, data.product_id, data.qty, data.tanggal, data.keterangan || null, data.user_id]
    ),

  sumQtyByMonth: (monthStart: string, monthEnd: string) =>
    queryOne<mysql.RowDataPacket & { total: number }>(
      "SELECT COALESCE(SUM(qty), 0) AS total FROM stock_out WHERE tanggal BETWEEN ? AND ?",
      [monthStart, monthEnd]
    ),

  dailyChart: (monthStart: string, monthEnd: string) =>
    query<mysql.RowDataPacket & { tanggal: string; total: number }>(
      `SELECT tanggal, SUM(qty) AS total FROM stock_out
       WHERE tanggal BETWEEN ? AND ? GROUP BY tanggal ORDER BY tanggal`,
      [monthStart, monthEnd]
    ),
};
