import { Elysia, t } from "elysia";
import bcrypt from "bcryptjs";
import { authMiddleware, requireRole } from "../middleware/auth";
import { userQueries } from "../db/queries/users";
import { execute } from "../db/connection";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .use(authMiddleware)

  // Profile sendiri
  .get("/me/profile", ({ user }) => userQueries.findById(user.id))

  .put(
    "/me/profile",
    async ({ body, user }) => {
      await userQueries.updateProfile(user.id, body.nama, body.email);
      return { success: true };
    },
    { body: t.Object({ nama: t.String({ minLength: 1 }), email: t.String({ format: "email" }) }) }
  )

  // Owner-only: kelola semua user
  .use(requireRole(["owner"]))

  .get("/", () => userQueries.findAll())

  .put(
    "/:id/password",
    async ({ params, body, set }) => {
      const target = await userQueries.findById(params.id);
      if (!target) {
        set.status = 404;
        return { error: "User tidak ditemukan" };
      }

      const passwordHash = await bcrypt.hash(body.password, 12);
      await userQueries.updatePassword(params.id, passwordHash);
      return { success: true };
    },
    { body: t.Object({ password: t.String({ minLength: 6 }) }) }
  )

  .put(
    "/:id",
    async ({ params, body, set }) => {
      const target = await userQueries.findById(params.id);
      if (!target) {
        set.status = 404;
        return { error: "User tidak ditemukan" };
      }

      const existing = await userQueries.findByEmail(body.email);
      if (existing && existing.id !== params.id) {
        set.status = 409;
        return { error: "Email sudah terdaftar" };
      }

      await userQueries.updateProfile(params.id, body.nama, body.email);
      return { success: true };
    },
    { body: t.Object({ nama: t.String({ minLength: 1 }), email: t.String({ format: "email" }) }) }
  )

  .put(
    "/:id/role",
    async ({ params, body, user, set }) => {
      if (params.id === user.id) {
        set.status = 400;
        return { error: "Tidak bisa mengubah role sendiri" };
      }
      // Pastikan tidak menghapus owner terakhir
      if (body.role !== "owner") {
        const ownerCount = await userQueries.countByRole("owner");
        const target = await userQueries.findById(params.id);
        if (target?.role === "owner" && (ownerCount?.cnt ?? 0) <= 1) {
          set.status = 400;
          return { error: "Tidak bisa mengubah role owner terakhir" };
        }
      }
      await userQueries.updateRole(params.id, body.role);
      return { success: true };
    },
    { body: t.Object({ role: t.Union([t.Literal("owner"), t.Literal("admin"), t.Literal("stok"), t.Literal("kasir")]) }) }
  )

  .put(
    "/:id/status",
    async ({ params, body, user, set }) => {
      if (params.id === user.id) {
        set.status = 400;
        return { error: "Tidak bisa menonaktifkan akun sendiri" };
      }
      await userQueries.updateStatus(params.id, body.is_active);
      return { success: true };
    },
    { body: t.Object({ is_active: t.Boolean() }) }
  );

export const dataRoutes = new Elysia({ prefix: "/api/data" })
  .use(authMiddleware)
  .use(requireRole(["owner"]))

  .post("/reset", async () => {
    // Hapus semua data bisnis kecuali user
    await execute("SET FOREIGN_KEY_CHECKS = 0", []);
    for (const table of ["audit_logs", "sales", "recipe_items", "recipes", "stock_out", "stock_in", "products", "suppliers", "units", "categories"]) {
      await execute(`DELETE FROM ${table} WHERE TRUE`, []);
    }
    await execute("SET FOREIGN_KEY_CHECKS = 1", []);

    // Re-insert kategori default
    const { execute: exec } = await import("../db/connection");
    const { randomUUID } = await import("crypto");
    for (const nama of ["Biji Kopi", "Susu", "Sirup", "Packaging", "Peralatan"]) {
      await exec("INSERT IGNORE INTO categories (id, nama) VALUES (?, ?)", [randomUUID(), nama]);
    }
    return { success: true };
  });
