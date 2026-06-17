import type { UserRole } from "@/types";

export const ROLES: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  kasir: "Kasir",
};

export function canAccessRoute(role: UserRole, path: string): boolean {
  if (role === "owner") return true;

  const kasirRoutes = [
    "/",
    "/master/barang",
    "/transaksi/keluar",
    "/transaksi/penjualan",
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

  if (role === "admin") {
    return adminRoutes.some(
      (route) => path === route || (route !== "/" && path.startsWith(route))
    );
  }

  return false;
}

export function getRoleNavItems(role: UserRole) {
  const allItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: "LayoutDashboard",
      roles: ["owner", "admin", "kasir"] as UserRole[],
    },
    {
      title: "Master Data",
      roles: ["owner", "admin"] as UserRole[],
      children: [
        { title: "Barang", href: "/master/barang", roles: ["owner", "admin", "kasir"] as UserRole[] },
        { title: "Kategori", href: "/master/kategori", roles: ["owner", "admin"] as UserRole[] },
        { title: "Supplier", href: "/master/supplier", roles: ["owner", "admin"] as UserRole[] },
      ],
    },
    {
      title: "Transaksi",
      roles: ["owner", "admin", "kasir"] as UserRole[],
      children: [
        { title: "Barang Masuk", href: "/transaksi/masuk", roles: ["owner", "admin"] as UserRole[] },
        { title: "Barang Keluar", href: "/transaksi/keluar", roles: ["owner", "admin", "kasir"] as UserRole[] },
        { title: "Produksi", href: "/transaksi/produksi", roles: ["owner", "admin"] as UserRole[] },
        { title: "Penjualan", href: "/transaksi/penjualan", roles: ["owner", "admin", "kasir"] as UserRole[] },
        { title: "Riwayat", href: "/transaksi/riwayat", roles: ["owner", "admin"] as UserRole[] },
      ],
    },
    {
      title: "Analisis",
      roles: ["owner", "admin"] as UserRole[],
      children: [
        { title: "Penggunaan Barang", href: "/analisis/penggunaan", roles: ["owner", "admin"] as UserRole[] },
        { title: "Forecast Stok", href: "/analisis/forecast", roles: ["owner", "admin"] as UserRole[] },
        { title: "Supplier", href: "/analisis/supplier", roles: ["owner", "admin"] as UserRole[] },
      ],
    },
    {
      title: "Laporan",
      roles: ["owner", "admin"] as UserRole[],
      children: [
        { title: "Barang Masuk", href: "/laporan/masuk", roles: ["owner", "admin"] as UserRole[] },
        { title: "Barang Keluar", href: "/laporan/keluar", roles: ["owner", "admin"] as UserRole[] },
        { title: "Stok", href: "/laporan/stok", roles: ["owner", "admin"] as UserRole[] },
        { title: "Supplier", href: "/laporan/supplier", roles: ["owner", "admin"] as UserRole[] },
        { title: "Penggunaan", href: "/laporan/penggunaan", roles: ["owner", "admin"] as UserRole[] },
      ],
    },
    {
      title: "Pengaturan",
      roles: ["owner", "admin", "kasir"] as UserRole[],
      children: [
        { title: "User", href: "/pengaturan/user", roles: ["owner"] as UserRole[] },
        { title: "Profil", href: "/pengaturan/profil", roles: ["owner", "admin", "kasir"] as UserRole[] },
        { title: "Audit Log", href: "/pengaturan/audit", roles: ["owner"] as UserRole[] },
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
