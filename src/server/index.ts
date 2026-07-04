import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { authRoutes } from "./routes/auth";
import { productRoutes } from "./routes/products";
import { masterRoutes } from "./routes/master";
import { stockRoutes } from "./routes/stock";
import { recipeRoutes } from "./routes/recipes";
import { analyticsRoutes } from "./routes/analytics";
import { userRoutes, dataRoutes } from "./routes/users";

const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === "production";

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
  .get("/api/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))

  // Serve frontend (production: static files dari public/)
  .use(
    staticPlugin({
      assets: "public",
      prefix: "/",
      noCache: !isProd,
    })
  )

  // SPA fallback: semua route non-/api → index.html
  .get("/*", ({ set }) => {
    if (isProd) {
      set.headers["content-type"] = "text/html";
      return Bun.file("public/index.html");
    }
    return { error: "Gunakan bun run dev untuk development" };
  })

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

export type App = typeof app;
