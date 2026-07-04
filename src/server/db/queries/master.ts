import { query, queryOne, execute } from "../connection";
import type mysql from "mysql2/promise";

export interface CategoryRow extends mysql.RowDataPacket {
  id: string; nama: string; created_at: string;
}
export interface UnitRow extends mysql.RowDataPacket {
  id: string; nama: string; singkatan: string; created_at: string;
}
export interface SupplierRow extends mysql.RowDataPacket {
  id: string; nama: string; telepon: string | null; email: string | null;
  alamat: string | null; pic: string | null; created_at: string;
}

export const categoryQueries = {
  findAll: () => query<CategoryRow>("SELECT * FROM categories ORDER BY nama"),
  findById: (id: string) => queryOne<CategoryRow>("SELECT * FROM categories WHERE id = ?", [id]),
  create: (id: string, nama: string) =>
    execute("INSERT INTO categories (id, nama) VALUES (?, ?)", [id, nama]),
  update: (id: string, nama: string) =>
    execute("UPDATE categories SET nama = ? WHERE id = ?", [nama, id]),
  delete: (id: string) => execute("DELETE FROM categories WHERE id = ?", [id]),
};

export const unitQueries = {
  findAll: () => query<UnitRow>("SELECT * FROM units ORDER BY nama"),
  findById: (id: string) => queryOne<UnitRow>("SELECT * FROM units WHERE id = ?", [id]),
  create: (id: string, nama: string, singkatan: string) =>
    execute("INSERT INTO units (id, nama, singkatan) VALUES (?, ?, ?)", [id, nama, singkatan]),
  update: (id: string, nama: string, singkatan: string) =>
    execute("UPDATE units SET nama = ?, singkatan = ? WHERE id = ?", [nama, singkatan, id]),
  delete: (id: string) => execute("DELETE FROM units WHERE id = ?", [id]),
};

export const supplierQueries = {
  findAll: () => query<SupplierRow>("SELECT * FROM suppliers ORDER BY nama"),
  findById: (id: string) => queryOne<SupplierRow>("SELECT * FROM suppliers WHERE id = ?", [id]),
  create: (id: string, data: Omit<SupplierRow, "id" | "created_at">) =>
    execute(
      "INSERT INTO suppliers (id, nama, telepon, email, alamat, pic) VALUES (?, ?, ?, ?, ?, ?)",
      [id, data.nama, data.telepon || null, data.email || null, data.alamat || null, data.pic || null]
    ),
  update: (id: string, data: Omit<SupplierRow, "id" | "created_at">) =>
    execute(
      "UPDATE suppliers SET nama=?, telepon=?, email=?, alamat=?, pic=? WHERE id=?",
      [data.nama, data.telepon || null, data.email || null, data.alamat || null, data.pic || null, id]
    ),
  delete: (id: string) => execute("DELETE FROM suppliers WHERE id = ?", [id]),
};
