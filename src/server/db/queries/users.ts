import { query, queryOne, execute } from "../connection";
import type mysql from "mysql2/promise";

export interface UserRow extends mysql.RowDataPacket {
  id: string;
  nama: string;
  email: string;
  password_hash: string;
  role: "owner" | "admin" | "stok" | "kasir";
  is_active: number;
  created_at: string;
}

export const userQueries = {
  findByEmail: (email: string) =>
    queryOne<UserRow>("SELECT * FROM users WHERE email = ?", [email]),

  findById: (id: string) =>
    queryOne<UserRow>("SELECT id, nama, email, role, is_active, created_at FROM users WHERE id = ?", [id]),

  findAll: () =>
    query<UserRow>("SELECT id, nama, email, role, is_active, created_at FROM users ORDER BY created_at DESC"),

  create: (id: string, nama: string, email: string, passwordHash: string, role = "kasir") =>
    execute(
      "INSERT INTO users (id, nama, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [id, nama, email, passwordHash, role]
    ),

  updateRole: (id: string, role: string) =>
    execute("UPDATE users SET role = ? WHERE id = ?", [role, id]),

  updateStatus: (id: string, isActive: boolean) =>
    execute("UPDATE users SET is_active = ? WHERE id = ?", [isActive ? 1 : 0, id]),

  updateProfile: (id: string, nama: string, email: string) =>
    execute("UPDATE users SET nama = ?, email = ? WHERE id = ?", [nama, email, id]),

  updatePassword: (id: string, passwordHash: string) =>
    execute("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]),

  countByRole: (role: string) =>
    queryOne<mysql.RowDataPacket & { cnt: number }>(
      "SELECT COUNT(*) AS cnt FROM users WHERE role = ?",
      [role]
    ),
};
