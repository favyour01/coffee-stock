import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";
import { authMiddleware, requireRole } from "../middleware/auth";
import { productQueries } from "../db/queries/products";

export const productRoutes = new Elysia({ prefix: "/api/products" })
  .use(authMiddleware)

  .get("/", async () => {
    return await productQueries.findAll();
  })

  .get("/search", async ({ query }) => {
    if (!query.kode) return null;
    return await productQueries.findByKode(query.kode);
  }, { query: t.Object({ kode: t.Optional(t.String()) }) })

  .get("/:id", async ({ params, set }) => {
    const product = await productQueries.findById(params.id);
    if (!product) { set.status = 404; return { error: "Barang tidak ditemukan" }; }
    return product;
  })

  .use(requireRole(["owner", "admin"]))

  .post("/", async ({ body, set }) => {
    const exists = await productQueries.findByKode(body.kode_barang);
    if (exists) { set.status = 409; return { error: "Kode barang sudah digunakan" }; }
    const id = randomUUID();
    await productQueries.create(id, body);
    return { success: true, id };
  }, {
    body: t.Object({
      kode_barang: t.String({ minLength: 1 }),
      nama_barang: t.String({ minLength: 1 }),
      kategori_id: t.Nullable(t.String()),
      supplier_id: t.Nullable(t.String()),
      satuan: t.String({ minLength: 1 }),
      harga_beli: t.Number({ minimum: 0 }),
      harga_jual: t.Number({ minimum: 0 }),
      minimum_stok: t.Number({ minimum: 0 }),
    }),
  })

  .put("/:id", async ({ params, body, set }) => {
    const product = await productQueries.findById(params.id);
    if (!product) { set.status = 404; return { error: "Barang tidak ditemukan" }; }
    await productQueries.update(params.id, body);
    return { success: true };
  }, {
    body: t.Object({
      kode_barang: t.String({ minLength: 1 }),
      nama_barang: t.String({ minLength: 1 }),
      kategori_id: t.Nullable(t.String()),
      supplier_id: t.Nullable(t.String()),
      satuan: t.String({ minLength: 1 }),
      harga_beli: t.Number({ minimum: 0 }),
      harga_jual: t.Number({ minimum: 0 }),
      minimum_stok: t.Number({ minimum: 0 }),
    }),
  })

  .delete("/:id", async ({ params, set }) => {
    const product = await productQueries.findById(params.id);
    if (!product) { set.status = 404; return { error: "Barang tidak ditemukan" }; }
    await productQueries.delete(params.id);
    return { success: true };
  });
