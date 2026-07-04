import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export interface JWTPayload {
  id: string;
  email: string;
  nama: string;
  role: "owner" | "admin" | "stok" | "kasir";
  is_active: boolean;
}

// Plugin JWT untuk dipakai di seluruh app
export const jwtPlugin = jwt({
  name: "jwt",
  secret: process.env.JWT_SECRET || "change_this_secret_in_production_min_32_chars",
  exp: "7d",
});

// Middleware auth: inject user ke context
export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .use(jwtPlugin)
  .derive({ as: "global" }, async ({ jwt, cookie, set }) => {
    const token = cookie.auth_token?.value;
    if (!token) {
      set.status = 401;
      throw new Error("Unauthorized: token tidak ditemukan");
    }
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      throw new Error("Unauthorized: token tidak valid");
    }
    if (!(payload as JWTPayload).is_active) {
      set.status = 403;
      throw new Error("Akun tidak aktif");
    }
    return { user: payload as JWTPayload };
  });

// Middleware role check — pakai di route yang perlu role tertentu
export function requireRole(roles: JWTPayload["role"][]) {
  return new Elysia({ name: `role-${roles.join("-")}` })
    .use(authMiddleware)
    .derive({ as: "local" }, ({ user, set }) => {
      if (!roles.includes(user.role)) {
        set.status = 403;
        throw new Error(`Akses ditolak. Role diperlukan: ${roles.join(", ")}`);
      }
      return {};
    });
}
