import { Elysia } from "elysia";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  getDashboardStats,
  getStockInChart,
  getStockOutChart,
  getTopUsage,
  getLowStockProducts,
  getUsageAnalysis,
  getSupplierStats,
  getForecastData,
  getAuditLogs,
} from "../db/queries/dashboard";

export const analyticsRoutes = new Elysia()
  .use(authMiddleware)

  // Dashboard (semua role)
  .get("/api/dashboard/stats", getDashboardStats)
  .get("/api/dashboard/stock-in-chart", getStockInChart)
  .get("/api/dashboard/stock-out-chart", getStockOutChart)
  .get("/api/dashboard/top-usage", getTopUsage)
  .get("/api/dashboard/low-stock", getLowStockProducts)

  // Analisis & laporan (owner + admin saja)
  .use(requireRole(["owner", "admin"]))
  .get("/api/analytics/usage", getUsageAnalysis)
  .get("/api/analytics/suppliers", getSupplierStats)
  .get("/api/analytics/forecast", getForecastData)
  .get("/api/audit-logs", ({ query }: { query: Record<string, string> }) =>
    getAuditLogs(query.limit ? Number(query.limit) : 200)
  );
