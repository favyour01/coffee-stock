import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";
import { authMiddleware, requireRole } from "../middleware/auth";
import { recipeQueries, saleQueries } from "../db/queries/recipes";
import pool from "../db/connection";

function mapDbError(err: unknown): { status: number; error: string } {
  const message = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string }).code;

  if (code === "ER_DUP_ENTRY" || /Duplicate entry/i.test(message)) {
    if (/uq_recipe_items|recipe_items/i.test(message)) {
      return { status: 400, error: "Bahan yang sama tidak boleh diinput dua kali dalam satu resep" };
    }
    return { status: 409, error: "Nama menu sudah digunakan" };
  }
  if (code === "ER_NO_REFERENCED_ROW_2" || message.toLowerCase().includes("foreign key")) {
    return { status: 400, error: "Salah satu bahan tidak valid atau sudah dihapus" };
  }
  return { status: 500, error: message || "Gagal menyimpan resep" };
}

/** Gabungkan qty jika product_id sama, buang item kosong */
function normalizeItems(items?: { product_id: string; qty: number }[]) {
  if (!items?.length) return [];
  const map = new Map<string, number>();
  for (const item of items) {
    if (!item.product_id || !(item.qty > 0)) continue;
    map.set(item.product_id, (map.get(item.product_id) ?? 0) + Number(item.qty));
  }
  return [...map.entries()].map(([product_id, qty]) => ({ product_id, qty }));
}

const recipeBody = t.Object({
  nama_menu: t.String({ minLength: 1 }),
  harga_jual: t.Number({ minimum: 0 }),
  items: t.Optional(t.Array(t.Object({
    product_id: t.String({ minLength: 1 }),
    qty: t.Number({ exclusiveMinimum: 0 }),
  }))),
});

export const recipeRoutes = new Elysia()
  .use(authMiddleware)

  // ─── Recipes ──────────────────────────────────────────────────────────────
  .get("/api/recipes", () => recipeQueries.findAllWithItems())

  .get("/api/recipes/:id", async ({ params, set }) => {
    const recipe = await recipeQueries.findWithItems(params.id);
    if (!recipe) { set.status = 404; return { error: "Menu tidak ditemukan" }; }
    return recipe;
  })

  .use(requireRole(["owner", "admin"]))

  .post("/api/recipes", async ({ body, set }) => {
    const items = normalizeItems(body.items);
    if (items.length === 0) {
      set.status = 400;
      return { error: "Tambahkan minimal 1 bahan dengan qty lebih dari 0" };
    }

    const id = randomUUID();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        "INSERT INTO recipes (id, nama_menu, harga_jual) VALUES (?, ?, ?)",
        [id, body.nama_menu.trim(), body.harga_jual]
      );
      for (const item of items) {
        await conn.query(
          "INSERT INTO recipe_items (id, recipe_id, product_id, qty) VALUES (?, ?, ?, ?)",
          [randomUUID(), id, item.product_id, item.qty]
        );
      }
      await conn.commit();
      return { success: true, id };
    } catch (err) {
      await conn.rollback();
      const mapped = mapDbError(err);
      set.status = mapped.status;
      return { error: mapped.error };
    } finally {
      conn.release();
    }
  }, { body: recipeBody })

  .put("/api/recipes/:id", async ({ params, body, set }) => {
    const items = body.items ? normalizeItems(body.items) : null;
    if (items && items.length === 0) {
      set.status = 400;
      return { error: "Tambahkan minimal 1 bahan dengan qty lebih dari 0" };
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        "UPDATE recipes SET nama_menu = ?, harga_jual = ? WHERE id = ?",
        [body.nama_menu.trim(), body.harga_jual, params.id]
      );
      if (items) {
        await conn.query("DELETE FROM recipe_items WHERE recipe_id = ?", [params.id]);
        for (const item of items) {
          await conn.query(
            "INSERT INTO recipe_items (id, recipe_id, product_id, qty) VALUES (?, ?, ?, ?)",
            [randomUUID(), params.id, item.product_id, item.qty]
          );
        }
      }
      await conn.commit();
      return { success: true };
    } catch (err) {
      await conn.rollback();
      const mapped = mapDbError(err);
      set.status = mapped.status;
      return { error: mapped.error };
    } finally {
      conn.release();
    }
  }, { body: recipeBody })

  .delete("/api/recipes/:id", async ({ params, set }) => {
    try {
      await recipeQueries.delete(params.id);
      return { success: true };
    } catch (err) {
      const mapped = mapDbError(err);
      set.status = mapped.status;
      return { error: mapped.error };
    }
  })

  // ─── Sales ────────────────────────────────────────────────────────────────
  .get("/api/sales", async ({ query }: { query: Record<string, string> }) => {
    if (query.start && query.end) return saleQueries.findByDateRange(query.start, query.end);
    return saleQueries.findAll();
  })

  .post("/api/sales", async ({ body, user, set }) => {
    if (!["owner", "admin", "kasir"].includes(user.role)) {
      set.status = 403;
      return { error: "Akses ditolak" };
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [items] = await conn.query<import("mysql2").RowDataPacket[]>(
        "SELECT product_id, qty FROM recipe_items WHERE recipe_id = ?",
        [body.recipe_id]
      );

      if (!items.length) throw new Error("Resep tidak memiliki bahan");

      for (const item of items) {
        const needed = Number(item.qty) * body.qty;
        const [pRows] = await conn.query<import("mysql2").RowDataPacket[]>(
          "SELECT stok, nama_barang FROM products WHERE id = ? FOR UPDATE",
          [item.product_id]
        );
        if (!pRows.length) throw new Error("Bahan tidak ditemukan");

        const currentStok = Number(pRows[0].stok);
        if (currentStok < needed) {
          throw new Error(`Stok bahan "${pRows[0].nama_barang}" tidak mencukupi. Tersedia: ${currentStok}, dibutuhkan: ${needed}`);
        }

        await conn.query(
          "UPDATE products SET stok = stok - ? WHERE id = ?",
          [needed, item.product_id]
        );
      }

      const id = randomUUID();
      await conn.query(
        "INSERT INTO sales (id, recipe_id, qty, tanggal, user_id) VALUES (?, ?, ?, ?, ?)",
        [id, body.recipe_id, body.qty, body.tanggal, user.id]
      );

      await conn.commit();
      return { success: true, id };
    } catch (err) {
      await conn.rollback();
      set.status = 400;
      return { error: (err as Error).message };
    } finally {
      conn.release();
    }
  }, {
    body: t.Object({
      recipe_id: t.String(),
      qty: t.Integer({ exclusiveMinimum: 0 }),
      tanggal: t.String(),
    }),
  });
