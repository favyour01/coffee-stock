import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";
import { authMiddleware, requireRole } from "../middleware/auth";
import { stockInQueries, stockOutQueries } from "../db/queries/stock";
import { addAuditLog } from "../db/queries/dashboard";

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
      try {
        await stockInQueries.create(id, { ...body, user_id: user.id });
        await addAuditLog(randomUUID(), user.id, "INSERT", "stock_in", id, null, body);
        return { success: true, id };
      } catch (err: unknown) {
        set.status = 400;
        return { error: (err as Error).message };
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
      const id = randomUUID();
      try {
        await stockOutQueries.create(id, { ...body, user_id: user.id });
        await addAuditLog(randomUUID(), user.id, "INSERT", "stock_out", id, null, body);
        return { success: true, id };
      } catch (err: unknown) {
        set.status = 400;
        return { error: (err as Error).message };
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
