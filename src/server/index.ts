import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { join } from "path";
import { existsSync } from "fs";
import { authRoutes } from "./routes/auth";
import { productRoutes } from "./routes/products";
import { masterRoutes } from "./routes/master";
import { stockRoutes } from "./routes/stock";
import { recipeRoutes } from "./routes/recipes";
import { analyticsRoutes } from "./routes/analytics";
import { userRoutes, dataRoutes } from "./routes/users";

const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === "production";
const PUBLIC_DIR = join(process.cwd(), "public");
const INDEX_HTML = join(PUBLIC_DIR, "index.html");

const app = new Elysia()
  .use(
    cors({
      origin: isProd ? false : ["http://localhost:3000"],
      credentials: true,
    })
  )

  // API routes
  .use(authRoutes)
  .use(productRoutes)
  .use(masterRoutes)
  .use(stockRoutes)
  .use(recipeRoutes)
  .use(analyticsRoutes)
  .use(userRoutes)
  .use(dataRoutes)

  // Health check
  .get("/api/health", () => ({ status: "ok", timestamp: new Date().toISOString() }));

// Production: serve frontend dari public/
if (isProd) {
  if (!existsSync(INDEX_HTML)) {
    console.error("❌ public/index.html tidak ditemukan! Jalankan: bun run build");
  }

  app
    // Asset JS/CSS — HARUS sebelum SPA fallback
    .get("/assets/*", ({ params, set }) => {
      const file = Bun.file(join(PUBLIC_DIR, "assets", params["*"]));
      if (!file.size) {
        set.status = 404;
        return { error: "Asset tidak ditemukan" };
      }
      return file;
    })
    // File statis lain (favicon, dll)
    .get("/favicon.svg", () => Bun.file(join(PUBLIC_DIR, "favicon.svg")))
    // SPA fallback — hanya untuk route React, BUKAN file .js/.css
    .get("/*", ({ request, set }) => {
      const pathname = new URL(request.url).pathname;

      if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
        set.status = 404;
        return { error: "File tidak ditemukan" };
      }

      if (!existsSync(INDEX_HTML)) {
        set.status = 500;
        return { error: "Frontend belum di-build. Jalankan: bun run build" };
      }

      set.headers["content-type"] = "text/html; charset=utf-8";
      return Bun.file(INDEX_HTML);
    });
} else {
  app.get("/*", () => ({ error: "Gunakan bun run dev untuk development" }));
}

app
  .onError(({ error, set }) => {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message.includes("Unauthorized")) set.status = 401;
    else if (message.includes("Akses ditolak") || message.includes("Hanya")) set.status = 403;
    else if (message.includes("tidak ditemukan")) set.status = 404;
    else set.status = 500;
    return { error: message };
  })
  .listen(PORT);

console.log(
  `🚀 CoffeeStock API running on http://localhost:${PORT} [${isProd ? "production" : "development"}]`
);
if (isProd) {
  console.log(`📁 Serving frontend from: ${PUBLIC_DIR}`);
}

export type App = typeof app;
