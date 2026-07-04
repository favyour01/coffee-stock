import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Tags,
  Truck,
  Ruler,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChefHat,
  ShoppingCart,
  History,
} from "lucide-react";
import type { UserRole } from "@/types";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const actions: QuickAction[] = [
  {
    title: "Tambah Barang",
    description: "Daftarkan barang baru",
    href: "/master/barang",
    icon: Package,
    roles: ["owner", "admin"],
  },
  {
    title: "Kelola Satuan",
    description: "Atur pcs, Kg, Liter, dll.",
    href: "/master/satuan",
    icon: Ruler,
    roles: ["owner", "admin"],
  },
  {
    title: "Kategori",
    description: "Kelola kategori barang",
    href: "/master/kategori",
    icon: Tags,
    roles: ["owner", "admin"],
  },
  {
    title: "Supplier",
    description: "Kelola data supplier",
    href: "/master/supplier",
    icon: Truck,
    roles: ["owner", "admin"],
  },
  {
    title: "Barang Masuk",
    description: "Tambah stok dari supplier",
    href: "/transaksi/masuk",
    icon: ArrowDownToLine,
    roles: ["owner", "admin", "stok"],
  },
  {
    title: "Barang Keluar",
    description: "Catat pemakaian / keluar",
    href: "/transaksi/keluar",
    icon: ArrowUpFromLine,
    roles: ["owner", "admin", "stok"],
  },
  {
    title: "Produksi",
    description: "Resep & produksi menu",
    href: "/transaksi/produksi",
    icon: ChefHat,
    roles: ["owner", "admin"],
  },
  {
    title: "Penjualan",
    description: "Kasir penjualan",
    href: "/transaksi/penjualan",
    icon: ShoppingCart,
    roles: ["owner", "admin", "kasir"],
  },
  {
    title: "Riwayat",
    description: "Lihat semua transaksi",
    href: "/transaksi/riwayat",
    icon: History,
    roles: ["owner", "admin"],
  },
];

export function QuickActions({ role }: { role: UserRole }) {
  const visible = actions.filter((a) => a.roles.includes(role));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Akses Cepat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="rounded-md bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
