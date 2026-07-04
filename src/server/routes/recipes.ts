import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";
import { authMiddleware, requireRole } from "../middleware/auth";
import { recipeQueries, saleQueries } from "../db/queries/recipes";

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
  .get("/api/sales", async ({ query }) => {
    if (query.start && query.end) return saleQueries.findByDateRange(query.start, query.end);
    return saleQueries.findAll();
  }, { query: t.Object({ start: t.Optional(t.String()), end: t.Optional(t.String()) }) })

  .post("/api/sales", async ({ body, user, set }) => {
    if (!["owner", "admin", "kasir"].includes(user.role)) {
      set.status = 403;
      return { error: "Akses ditolak" };
    }
    const id = randomUUID();
    try {
      await saleQueries.create(id, { ...body, user_id: user.id });
      return { success: true, id };
    } catch (err: unknown) {
      set.status = 400;
      return { error: (err as Error).message };
    }
  }, {
    body: t.Object({
      recipe_id: t.String(),
      qty: t.Integer({ exclusiveMinimum: 0 }),
      tanggal: t.String(),
    }),
  });
