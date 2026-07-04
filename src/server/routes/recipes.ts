import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";
import { authMiddleware, requireRole } from "../middleware/auth";
import { recipeQueries, saleQueries } from "../db/queries/recipes";
import pool from "../db/connection";

export const recipeRoutes = new Elysia()
  .use(authMiddleware)

  // ─── Recipes ──────────────────────────────────────────────────────────────
  .get("/api/recipes", () => recipeQueries.findAll())

  .get("/api/recipes/:id", async ({ params, set }) => {
    const recipe = await recipeQueries.findWithItems(params.id);
    if (!recipe) { set.status = 404; return { error: "Menu tidak ditemukan" }; }
    return recipe;
  })

  .use(requireRole(["owner", "admin"]))

  .post("/api/recipes", async ({ body }) => {
    const id = randomUUID();
    await recipeQueries.create(id, body.nama_menu, body.harga_jual);
    if (body.items?.length) {
      for (const item of body.items) {
        await recipeQueries.addItem(randomUUID(), id, item.product_id, item.qty);
      }
    }
    return { success: true, id };
  }, {
    body: t.Object({
      nama_menu: t.String({ minLength: 1 }),
      harga_jual: t.Number({ minimum: 0 }),
      items: t.Optional(t.Array(t.Object({ product_id: t.String(), qty: t.Number({ exclusiveMinimum: 0 }) }))),
    }),
  })

  .put("/api/recipes/:id", async ({ params, body }) => {
    await recipeQueries.update(params.id, body.nama_menu, body.harga_jual);
    if (body.items) {
      await recipeQueries.removeAllItems(params.id);
      for (const item of body.items) {
        await recipeQueries.addItem(randomUUID(), params.id, item.product_id, item.qty);
      }
    }
    return { success: true };
  }, {
    body: t.Object({
      nama_menu: t.String({ minLength: 1 }),
      harga_jual: t.Number({ minimum: 0 }),
      items: t.Optional(t.Array(t.Object({ product_id: t.String(), qty: t.Number({ exclusiveMinimum: 0 }) }))),
    }),
  })

  .delete("/api/recipes/:id", async ({ params }) => {
    await recipeQueries.delete(params.id);
    return { success: true };
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

      // Ambil bahan-bahan resep
      const [items] = await conn.query<import("mysql2").RowDataPacket[]>(
        "SELECT product_id, qty FROM recipe_items WHERE recipe_id = ?",
        [body.recipe_id]
      );

      if (!items.length) throw new Error("Resep tidak memiliki bahan");

      // Cek dan kurangi stok setiap bahan
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
