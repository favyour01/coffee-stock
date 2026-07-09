import { Elysia, t } from "elysia";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { jwtPlugin, authMiddleware, type JWTPayload } from "../middleware/auth";
import { userQueries } from "../db/queries/users";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(jwtPlugin)

  // POST /api/auth/login
  .post(
    "/login",
    async ({ body, jwt, cookie, set }) => {
      const user = await userQueries.findByEmail(body.email);

      if (!user) {
        set.status = 401;
        return { error: "Email atau password salah" };
      }

      const valid = await bcrypt.compare(body.password, user.password_hash);
      if (!valid) {
        set.status = 401;
        return { error: "Email atau password salah" };
      }

      if (!user.is_active) {
        set.status = 403;
        return { error: "Akun tidak aktif. Hubungi Owner." };
      }

      const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
        is_active: Boolean(user.is_active),
      };

      const token = await jwt.sign(payload);

      cookie.auth_token.set({
        value: token,
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 hari
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      return { user: payload };
    },
    {
      body: t.Object({
        email: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )

  // POST /api/auth/logout
  .post("/logout", ({ cookie }) => {
    cookie.auth_token.remove();
    return { success: true };
  })

  // GET /api/auth/me — cek sesi aktif
  .use(authMiddleware)
  .get("/me", ({ user }) => ({ user }))

  // POST /api/auth/change-password
  .post(
    "/change-password",
    async ({ body, user, set }) => {
      const dbUser = await userQueries.findByEmail(user.email);
      if (!dbUser) { set.status = 404; return { error: "User tidak ditemukan" }; }

      const valid = await bcrypt.compare(body.current_password, dbUser.password_hash);
      if (!valid) { set.status = 400; return { error: "Password lama salah" }; }

      const newHash = await bcrypt.hash(body.new_password, 12);
      await userQueries.updatePassword(user.id, newHash);
      return { success: true };
    },
    {
      body: t.Object({
        current_password: t.String({ minLength: 1 }),
        new_password: t.String({ minLength: 6 }),
      }),
    }
  )

  // POST /api/auth/register — hanya bisa dibuat owner (untuk tambah user)
  .post(
    "/register",
    async ({ body, user, set }) => {
      if (user.role !== "owner") {
        set.status = 403;
        return { error: "Hanya Owner yang bisa membuat user baru" };
      }

      const exists = await userQueries.findByEmail(body.email);
      if (exists) {
        set.status = 409;
        return { error: "Email sudah terdaftar" };
      }

      const passwordHash = await bcrypt.hash(body.password, 12);
      const id = randomUUID();
      await userQueries.create(id, body.nama, body.email, passwordHash, body.role);
      return { success: true, id };
    },
    {
      body: t.Object({
        nama: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        role: t.Union([
          t.Literal("owner"),
          t.Literal("admin"),
          t.Literal("stok"),
          t.Literal("kasir"),
        ]),
      }),
    }
  );
