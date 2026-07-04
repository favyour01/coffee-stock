import type { UserRole } from "@/types";

export const ROLES: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  stok: "Stok",
  kasir: "Kasir",
};

export function canAccessRoute(role: UserRole, path: string): boolean {
  if (role === "owner") return true;

  const kasirRoutes = [
    "/",
    "/transaksi/penjualan",
    "/pengaturan/profil",
  ];

  const stockRoutes = [
    "/",
    "/transaksi/masuk",
    "/transaksi/keluar",
    "/pengaturan/profil",
  ];

  const adminRoutes = [
    "/",
    "/master",
    "/transaksi",
    "/analisis",
    "/laporan",
    "/pengaturan/profil",
  ];

  if (role === "kasir") {
    return kasirRoutes.some(
      (route) => path === route || (route !== "/" && path.startsWith(route))
    );
  }

  if (role === "stok") {
    return stockRoutes.some(
      (route) => path === route || (route !== "/" && path.startsWith(route))
    );
  }

  if (role === "admin") {
    return adminRoutes.some(
      (route) => path === route || (route !== "/" && path.startsWith(route))
    );
  }

  return false;
}

export interface NavChild {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

export interface NavItem {
  title: string;
  href?: string;
  icon: string;
  roles: UserRole[];
  children?: NavChild[];
}

export function getRoleNavItems(role: UserRole): NavItem[] {
  const allItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: "LayoutDashboard",
      roles: ["owner", "admin", "stok", "kasir"],
    },
    {
      title: "Master Data",
      icon: "Database",
      roles: ["owner", "admin"],
      children: [
        { title: "Barang", href: "/master/barang", icon: "Package", roles: ["owner", "admin"] },
        { title: "Satuan", href: "/master/satuan", icon: "Ruler", roles: ["owner", "admin"] },
        { title: "Kategori", href: "/master/kategori", icon: "Tags", roles: ["owner", "admin"] },
        { title: "Supplier", href: "/master/supplier", icon: "Truck", roles: ["owner", "admin"] },
      ],
    },
    {
      title: "Transaksi",
      icon: "ArrowLeftRight",
      roles: ["owner", "admin", "stok", "kasir"],
      children: [
        { title: "Barang Masuk", href: "/transaksi/masuk", icon: "ArrowDownToLine", roles: ["owner", "admin", "stok"] },
        { title: "Barang Keluar", href: "/transaksi/keluar", icon: "ArrowUpFromLine", roles: ["owner", "admin", "stok"] },
        { title: "Produksi", href: "/transaksi/produksi", icon: "ChefHat", roles: ["owner", "admin"] },
        { title: "Penjualan", href: "/transaksi/penjualan", icon: "ShoppingCart", roles: ["owner", "admin", "kasir"] },
        { title: "Riwayat", href: "/transaksi/riwayat", icon: "History", roles: ["owner", "admin"] },
      ],
    },
    {
      title: "Analisis",
      icon: "BarChart3",
      roles: ["owner", "admin"],
      children: [
        { title: "Penggunaan Barang", href: "/analisis/penggunaan", icon: "BarChart3", roles: ["owner", "admin"] },
        { title: "Forecast Stok", href: "/analisis/forecast", icon: "TrendingUp", roles: ["owner", "admin"] },
        { title: "Supplier", href: "/analisis/supplier", icon: "Truck", roles: ["owner", "admin"] },
      ],
    },
    {
      title: "Laporan",
      icon: "FileText",
      roles: ["owner", "admin"],
      children: [
        { title: "Barang Masuk", href: "/laporan/masuk", icon: "ArrowDownToLine", roles: ["owner", "admin"] },
        { title: "Barang Keluar", href: "/laporan/keluar", icon: "ArrowUpFromLine", roles: ["owner", "admin"] },
        { title: "Stok", href: "/laporan/stok", icon: "Package", roles: ["owner", "admin"] },
        { title: "Supplier", href: "/laporan/supplier", icon: "Truck", roles: ["owner", "admin"] },
        { title: "Penggunaan", href: "/laporan/penggunaan", icon: "ClipboardList", roles: ["owner", "admin"] },
      ],
    },
    {
      title: "Pengaturan",
      icon: "Settings",
      roles: ["owner", "admin", "stok", "kasir"],
      children: [
        { title: "User", href: "/pengaturan/user", icon: "Users", roles: ["owner"] },
        { title: "Kelola Data", href: "/pengaturan/data", icon: "Database", roles: ["owner"] },
        { title: "Profil", href: "/pengaturan/profil", icon: "User", roles: ["owner", "admin", "stok", "kasir"] },
        { title: "Audit Log", href: "/pengaturan/audit", icon: "ClipboardList", roles: ["owner"] },
      ],
    },
  ];

  return allItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }))
    .filter((item) => !item.children || item.children.length > 0);
}
