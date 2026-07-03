export type UserRole = "owner" | "admin" | "stok" | "kasir";

export interface Profile {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  nama: string;
  created_at: string;
}

export interface Unit {
  id: string;
  nama: string;
  singkatan: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  nama: string;
  telepon: string | null;
  email: string | null;
  alamat: string | null;
  pic: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  kode_barang: string;
  nama_barang: string;
  kategori_id: string | null;
  supplier_id: string | null;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  stok: number;
  minimum_stok: number;
  qr_code_url: string | null;
  created_at: string;
  categories?: Category | null;
  suppliers?: Supplier | null;
}

export interface StockIn {
  id: string;
  product_id: string;
  supplier_id: string;
  qty: number;
  harga_beli: number;
  tanggal: string;
  user_id: string;
  created_at: string;
  products?: Product;
  suppliers?: Supplier;
  profiles?: Profile;
}

export interface StockOut {
  id: string;
  product_id: string;
  qty: number;
  tanggal: string;
  keterangan: string | null;
  user_id: string;
  created_at: string;
  products?: Product;
  profiles?: Profile;
}

export interface Recipe {
  id: string;
  nama_menu: string;
  harga_jual: number;
  created_at: string;
  recipe_items?: RecipeItem[];
}

export interface RecipeItem {
  id: string;
  recipe_id: string;
  product_id: string;
  qty: number;
  products?: Product;
}

export interface Sale {
  id: string;
  recipe_id: string;
  qty: number;
  tanggal: string;
  user_id: string;
  created_at: string;
  recipes?: Recipe;
  profiles?: Profile;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  profiles?: Profile;
}

export interface DashboardStats {
  totalProducts: number;
  totalSuppliers: number;
  stockInThisMonth: number;
  stockOutThisMonth: number;
  inventoryValue: number;
  lowStockCount: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface UsageData {
  product_id: string;
  nama_barang: string;
  satuan: string;
  total_usage: number;
}

export interface SupplierStats {
  supplier_id: string;
  nama: string;
  transaction_count: number;
  total_pembelian: number;
}

export interface ForecastData {
  product_id: string;
  nama_barang: string;
  satuan: string;
  stok: number;
  minimum_stok: number;
  monthly_usage: number[];
  forecast: number;
  needs_restock: boolean;
}

export type TransactionType = "stock_in" | "stock_out" | "sale";

export interface TransactionHistory {
  id: string;
  type: TransactionType;
  tanggal: string;
  description: string;
  qty: number;
  user_name: string;
}
