import { query, queryOne, execute } from "../connection";
import type mysql from "mysql2/promise";

export interface RecipeRow extends mysql.RowDataPacket {
  id: string; nama_menu: string; harga_jual: number; created_at: string;
}
export interface RecipeItemRow extends mysql.RowDataPacket {
  id: string; recipe_id: string; product_id: string; qty: number;
  product_nama?: string; satuan?: string;
}
export interface SaleRow extends mysql.RowDataPacket {
  id: string; recipe_id: string; qty: number; tanggal: string;
  user_id: string; created_at: string;
  recipe_nama?: string; user_nama?: string; harga_jual?: number;
}

export const recipeQueries = {
  findAll: () =>
    query<RecipeRow>("SELECT * FROM recipes ORDER BY nama_menu"),

  findById: (id: string) =>
    queryOne<RecipeRow>("SELECT * FROM recipes WHERE id = ?", [id]),

  findWithItems: async (id: string) => {
    const recipe = await queryOne<RecipeRow>("SELECT * FROM recipes WHERE id = ?", [id]);
    if (!recipe) return null;
    const items = await query<RecipeItemRow>(
      `SELECT ri.*, p.nama_barang AS product_nama, p.satuan
       FROM recipe_items ri JOIN products p ON ri.product_id = p.id
       WHERE ri.recipe_id = ?`,
      [id]
    );
    return { ...recipe, items };
  },

  create: (id: string, nama_menu: string, harga_jual: number) =>
    execute("INSERT INTO recipes (id, nama_menu, harga_jual) VALUES (?, ?, ?)", [id, nama_menu, harga_jual]),

  update: (id: string, nama_menu: string, harga_jual: number) =>
    execute("UPDATE recipes SET nama_menu = ?, harga_jual = ? WHERE id = ?", [nama_menu, harga_jual, id]),

  delete: (id: string) =>
    execute("DELETE FROM recipes WHERE id = ?", [id]),

  addItem: (id: string, recipe_id: string, product_id: string, qty: number) =>
    execute(
      "INSERT INTO recipe_items (id, recipe_id, product_id, qty) VALUES (?, ?, ?, ?)",
      [id, recipe_id, product_id, qty]
    ),

  removeItem: (id: string) =>
    execute("DELETE FROM recipe_items WHERE id = ?", [id]),

  removeAllItems: (recipe_id: string) =>
    execute("DELETE FROM recipe_items WHERE recipe_id = ?", [recipe_id]),
};

export const saleQueries = {
  findAll: (limit = 200) =>
    query<SaleRow>(
      `SELECT s.*, r.nama_menu AS recipe_nama, r.harga_jual, u.nama AS user_nama
       FROM sales s JOIN recipes r ON s.recipe_id = r.id JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC LIMIT ?`,
      [limit]
    ),

  findByDateRange: (start: string, end: string) =>
    query<SaleRow>(
      `SELECT s.*, r.nama_menu AS recipe_nama, r.harga_jual, u.nama AS user_nama
       FROM sales s JOIN recipes r ON s.recipe_id = r.id JOIN users u ON s.user_id = u.id
       WHERE s.tanggal BETWEEN ? AND ? ORDER BY s.tanggal DESC`,
      [start, end]
    ),

  create: (id: string, data: { recipe_id: string; qty: number; tanggal: string; user_id: string }) =>
    execute(
      "INSERT INTO sales (id, recipe_id, qty, tanggal, user_id) VALUES (?, ?, ?, ?, ?)",
      [id, data.recipe_id, data.qty, data.tanggal, data.user_id]
    ),
};
