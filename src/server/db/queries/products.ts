import { query, queryOne, execute } from "../connection";
import type mysql from "mysql2/promise";

export interface ProductRow extends mysql.RowDataPacket {
  id: string;
  kode_barang: string;
  nama_barang: string;
  kategori_id: string | null;
  supplier_id: string | null;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  stok: number;
  minimum_stok: number;
  qr_code_url: string | null;
  created_at: string;
  kategori_nama?: string;
  supplier_nama?: string;
}

const SELECT_WITH_JOINS = `
  SELECT p.*, c.nama AS kategori_nama, s.nama AS supplier_nama
  FROM products p
  LEFT JOIN categories c ON p.kategori_id = c.id
  LEFT JOIN suppliers s ON p.supplier_id = s.id
`;

export const productQueries = {
  findAll: () => query<ProductRow>(`${SELECT_WITH_JOINS} ORDER BY p.nama_barang`),

  findById: (id: string) =>
    queryOne<ProductRow>(`${SELECT_WITH_JOINS} WHERE p.id = ?`, [id]),

  findByKode: (kode: string) =>
    queryOne<ProductRow>(`${SELECT_WITH_JOINS} WHERE p.kode_barang = ?`, [kode]),

  create: (id: string, data: {
    kode_barang: string; nama_barang: string; kategori_id: string | null;
    supplier_id: string | null; satuan: string; harga_beli: number;
    harga_jual: number; minimum_stok: number;
  }) =>
    execute(
      `INSERT INTO products (id, kode_barang, nama_barang, kategori_id, supplier_id,
        satuan, harga_beli, harga_jual, stok, minimum_stok)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, data.kode_barang, data.nama_barang, data.kategori_id || null,
       data.supplier_id || null, data.satuan, data.harga_beli, data.harga_jual, data.minimum_stok]
    ),

  update: (id: string, data: {
    kode_barang: string; nama_barang: string; kategori_id: string | null;
    supplier_id: string | null; satuan: string; harga_beli: number;
    harga_jual: number; minimum_stok: number;
  }) =>
    execute(
      `UPDATE products SET kode_barang=?, nama_barang=?, kategori_id=?, supplier_id=?,
        satuan=?, harga_beli=?, harga_jual=?, minimum_stok=? WHERE id=?`,
      [data.kode_barang, data.nama_barang, data.kategori_id || null,
       data.supplier_id || null, data.satuan, data.harga_beli, data.harga_jual,
       data.minimum_stok, id]
    ),

  updateQrUrl: (id: string, url: string) =>
    execute("UPDATE products SET qr_code_url = ? WHERE id = ?", [url, id]),

  delete: (id: string) =>
    execute("DELETE FROM products WHERE id = ?", [id]),

  getLowStock: () =>
    query<ProductRow>(
      `${SELECT_WITH_JOINS} WHERE p.stok < p.minimum_stok ORDER BY p.stok ASC`
    ),
};
