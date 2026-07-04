/**
 * API client — fetch wrapper ke Elysia backend (/api/*)
 */

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`/api${path}`, options);

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data.error || data.message || message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
import type { User } from "@/types";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User }>("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  me: () => api.get<{ user: User }>("/auth/me"),
  changePassword: (current_password: string, new_password: string) =>
    api.post("/auth/change-password", { current_password, new_password }),
  register: (data: { nama: string; email: string; password: string; role: string }) =>
    api.post<{ success: boolean; id: string }>("/auth/register", data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
import type { DashboardStats, ChartDataPoint } from "@/types";

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard/stats"),
  stockInChart: () => api.get<ChartDataPoint[]>("/dashboard/stock-in-chart"),
  stockOutChart: () => api.get<ChartDataPoint[]>("/dashboard/stock-out-chart"),
  topUsage: () => api.get<ChartDataPoint[]>("/dashboard/top-usage"),
  lowStock: () => api.get<import("@/types").Product[]>("/dashboard/low-stock"),
};

// ─── Master ───────────────────────────────────────────────────────────────────
import type { Category, Unit, Supplier, Product } from "@/types";

export const categoryApi = {
  list: () => api.get<Category[]>("/categories"),
  create: (nama: string) => api.post<{ success: boolean; id: string }>("/categories", { nama }),
  update: (id: string, nama: string) => api.put(`/categories/${id}`, { nama }),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const unitApi = {
  list: () => api.get<Unit[]>("/units"),
  create: (nama: string, singkatan: string) =>
    api.post<{ success: boolean; id: string }>("/units", { nama, singkatan }),
  update: (id: string, nama: string, singkatan: string) =>
    api.put(`/units/${id}`, { nama, singkatan }),
  delete: (id: string) => api.delete(`/units/${id}`),
};

export const supplierApi = {
  list: () => api.get<Supplier[]>("/suppliers"),
  create: (data: Omit<Supplier, "id" | "created_at">) =>
    api.post<{ success: boolean; id: string }>("/suppliers", data),
  update: (id: string, data: Omit<Supplier, "id" | "created_at">) =>
    api.put(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};

export const productApi = {
  list: () => api.get<Product[]>("/products"),
  get: (id: string) => api.get<Product>(`/products/${id}`),
  search: (kode: string) => api.get<Product | null>(`/products/search?kode=${encodeURIComponent(kode)}`),
  create: (data: Omit<Product, "id" | "created_at" | "stok" | "qr_code_url" | "categories" | "suppliers" | "kategori_nama" | "supplier_nama">) =>
    api.post<{ success: boolean; id: string }>("/products", data),
  update: (id: string, data: Omit<Product, "id" | "created_at" | "stok" | "qr_code_url" | "categories" | "suppliers" | "kategori_nama" | "supplier_nama">) =>
    api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// ─── Stock ─────────────────────────────────────────────────────────────────────
import type { StockIn, StockOut } from "@/types";

export const stockApi = {
  inList: (start?: string, end?: string) =>
    api.get<StockIn[]>(`/stock-in${start && end ? `?start=${start}&end=${end}` : ""}`),
  inCreate: (data: { product_id: string; supplier_id: string; qty: number; harga_beli: number; tanggal: string }) =>
    api.post<{ success: boolean; id: string }>("/stock-in", data),
  outList: (start?: string, end?: string) =>
    api.get<StockOut[]>(`/stock-out${start && end ? `?start=${start}&end=${end}` : ""}`),
  outCreate: (data: { product_id: string; qty: number; tanggal: string; keterangan?: string }) =>
    api.post<{ success: boolean; id: string }>("/stock-out", data),
};

// ─── Recipes & Sales ──────────────────────────────────────────────────────────
import type { Recipe, Sale } from "@/types";

export const recipeApi = {
  list: () => api.get<Recipe[]>("/recipes"),
  get: (id: string) => api.get<Recipe>(`/recipes/${id}`),
  create: (data: { nama_menu: string; harga_jual: number; items?: { product_id: string; qty: number }[] }) =>
    api.post<{ success: boolean; id: string }>("/recipes", data),
  update: (id: string, data: { nama_menu: string; harga_jual: number; items?: { product_id: string; qty: number }[] }) =>
    api.put(`/recipes/${id}`, data),
  delete: (id: string) => api.delete(`/recipes/${id}`),
};

export const saleApi = {
  list: (start?: string, end?: string) =>
    api.get<Sale[]>(`/sales${start && end ? `?start=${start}&end=${end}` : ""}`),
  create: (data: { recipe_id: string; qty: number; tanggal: string }) =>
    api.post<{ success: boolean; id: string }>("/sales", data),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
import type { UsageData, SupplierStats, ForecastData } from "@/types";

export const analyticsApi = {
  usage: () => api.get<{ mostUsed: UsageData[]; leastUsed: UsageData[] }>("/analytics/usage"),
  suppliers: () => api.get<SupplierStats[]>("/analytics/suppliers"),
  forecast: () => api.get<ForecastData[]>("/analytics/forecast"),
};

// ─── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  list: () => api.get<User[]>("/users"),
  myProfile: () => api.get<User>("/users/me/profile"),
  updateProfile: (data: { nama: string; email: string }) =>
    api.put("/users/me/profile", data),
  updateRole: (id: string, role: string) =>
    api.put(`/users/${id}/role`, { role }),
  updateStatus: (id: string, is_active: boolean) =>
    api.put(`/users/${id}/status`, { is_active }),
};

// ─── Audit & Data ─────────────────────────────────────────────────────────────
import type { AuditLog } from "@/types";

export const auditApi = {
  list: (limit?: number) =>
    api.get<AuditLog[]>(`/audit-logs${limit ? `?limit=${limit}` : ""}`),
};

export const dataApi = {
  reset: () => api.post("/data/reset"),
};
