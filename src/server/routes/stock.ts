import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";
import { authMiddleware } from "../middleware/auth";
import { stockInQueries, stockOutQueries } from "../db/queries/stock";
import { addAuditLog } from "../db/queries/dashboard";
import pool from "../db/connection";

export const stockRoutes = new Elysia()
  .use(authMiddleware)

  // ─── Stock In ─────────────────────────────────────────────────────────────
  .get("/api/stock-in", async ({ query }) => {
    if (query.start && query.end) {
      return await stockInQueries.findByDateRange(query.start, query.end);
    }
    return await stockInQueries.findAll();
  }, { query: t.Object({ start: t.Optional(t.String()), end: t.Optional(t.String()) }) })

  .post(
    "/api/stock-in",
    async ({ body, user, set }) => {
      if (!["owner", "admin", "stok"].includes(user.role)) {
        set.status = 403;
        return { error: "Akses ditolak" };
      }

      const id = randomUUID();
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // Insert stock_in
        await conn.query(
          "INSERT INTO stock_in (id, product_id, supplier_id, qty, harga_beli, tanggal, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [id, body.product_id, body.supplier_id, body.qty, body.harga_beli, body.tanggal, user.id]
        );

        // Update stok produk
        await conn.query(
          "UPDATE products SET stok = stok + ? WHERE id = ?",
          [body.qty, body.product_id]
        );

        await conn.commit();
        await addAuditLog(randomUUID(), user.id, "INSERT", "stock_in", id, null, body);
        return { success: true, id };
      } catch (err) {
        await conn.rollback();
        set.status = 400;
        return { error: (err as Error).message };
      } finally {
        conn.release();
      }
    },
    {
      body: t.Object({
        product_id: t.String(),
        supplier_id: t.String(),
        qty: t.Number({ exclusiveMinimum: 0 }),
        harga_beli: t.Number({ minimum: 0 }),
        tanggal: t.String(),
      }),
    }
  )

  // ─── Stock Out ────────────────────────────────────────────────────────────
  .get("/api/stock-out", async ({ query }) => {
    if (query.start && query.end) {
      return await stockOutQueries.findByDateRange(query.start, query.end);
    }
    return await stockOutQueries.findAll();
  }, { query: t.Object({ start: t.Optional(t.String()), end: t.Optional(t.String()) }) })

  .post(
    "/api/stock-out",
    async ({ body, user, set }) => {
      if (!["owner", "admin", "stok"].includes(user.role)) {
        set.status = 403;
        return { error: "Akses ditolak" };
      }

      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // Cek stok tersedia
        const [rows] = await conn.query<import("mysql2").RowDataPacket[]>(
          "SELECT stok FROM products WHERE id = ? FOR UPDATE",
          [body.product_id]
        );
        if (!rows.length) throw new Error("Barang tidak ditemukan");

        const currentStok = Number(rows[0].stok);
        if (currentStok < body.qty) {
          throw new Error(`Stok tidak mencukupi. Tersedia: ${currentStok}`);
        }

        const id = randomUUID();
        await conn.query(
          "INSERT INTO stock_out (id, product_id, qty, tanggal, keterangan, user_id) VALUES (?, ?, ?, ?, ?, ?)",
          [id, body.product_id, body.qty, body.tanggal, body.keterangan ?? null, user.id]
        );

        await conn.query(
          "UPDATE products SET stok = stok - ? WHERE id = ?",
          [body.qty, body.product_id]
        );

        await conn.commit();
        await addAuditLog(randomUUID(), user.id, "INSERT", "stock_out", id, null, body);
        return { success: true, id };
      } catch (err) {
        await conn.rollback();
        set.status = 400;
        return { error: (err as Error).message };
      } finally {
        conn.release();
      }
    },
    {
      body: t.Object({
        product_id: t.String(),
        qty: t.Number({ exclusiveMinimum: 0 }),
        tanggal: t.String(),
        keterangan: t.Optional(t.String()),
      }),
    }
  );
