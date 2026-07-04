import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";
import { authMiddleware, requireRole } from "../middleware/auth";
import { categoryQueries, unitQueries, supplierQueries } from "../db/queries/master";

// ─── Categories ─────────────────────────────────────────────────────────────
const categoryRoutes = new Elysia({ prefix: "/api/categories" })
  .use(authMiddleware)
  .get("/", () => categoryQueries.findAll())
  .use(requireRole(["owner", "admin"]))
  .post("/", async ({ body, set }) => {
    const id = randomUUID();
    try {
      await categoryQueries.create(id, body.nama);
      return { success: true, id };
    } catch {
      set.status = 409;
      return { error: "Nama kategori sudah ada" };
    }
  }, { body: t.Object({ nama: t.String({ minLength: 1 }) }) })
  .put("/:id", async ({ params, body }) => {
    await categoryQueries.update(params.id, body.nama);
    return { success: true };
  }, { body: t.Object({ nama: t.String({ minLength: 1 }) }) })
  .delete("/:id", async ({ params }) => {
    await categoryQueries.delete(params.id);
    return { success: true };
  });

// ─── Units ───────────────────────────────────────────────────────────────────
const unitRoutes = new Elysia({ prefix: "/api/units" })
  .use(authMiddleware)
  .get("/", () => unitQueries.findAll())
  .use(requireRole(["owner", "admin"]))
  .post("/", async ({ body }) => {
    const id = randomUUID();
    await unitQueries.create(id, body.nama, body.singkatan);
    return { success: true, id };
  }, { body: t.Object({ nama: t.String({ minLength: 1 }), singkatan: t.String({ minLength: 1 }) }) })
  .put("/:id", async ({ params, body }) => {
    await unitQueries.update(params.id, body.nama, body.singkatan);
    return { success: true };
  }, { body: t.Object({ nama: t.String({ minLength: 1 }), singkatan: t.String({ minLength: 1 }) }) })
  .delete("/:id", async ({ params }) => {
    await unitQueries.delete(params.id);
    return { success: true };
  });

// ─── Suppliers ───────────────────────────────────────────────────────────────
const supplierRoutes = new Elysia({ prefix: "/api/suppliers" })
  .use(authMiddleware)
  .get("/", () => supplierQueries.findAll())
  .use(requireRole(["owner", "admin"]))
  .post("/", async ({ body }) => {
    const id = randomUUID();
    await supplierQueries.create(id, body);
    return { success: true, id };
  }, {
    body: t.Object({
      nama: t.String({ minLength: 1 }),
      telepon: t.Optional(t.Nullable(t.String())),
      email: t.Optional(t.Nullable(t.String())),
      alamat: t.Optional(t.Nullable(t.String())),
      pic: t.Optional(t.Nullable(t.String())),
    }),
  })
  .put("/:id", async ({ params, body }) => {
    await supplierQueries.update(params.id, body);
    return { success: true };
  }, {
    body: t.Object({
      nama: t.String({ minLength: 1 }),
      telepon: t.Optional(t.Nullable(t.String())),
      email: t.Optional(t.Nullable(t.String())),
      alamat: t.Optional(t.Nullable(t.String())),
      pic: t.Optional(t.Nullable(t.String())),
    }),
  })
  .delete("/:id", async ({ params }) => {
    await supplierQueries.delete(params.id);
    return { success: true };
  });

export const masterRoutes = new Elysia()
  .use(categoryRoutes)
  .use(unitRoutes)
  .use(supplierRoutes);
