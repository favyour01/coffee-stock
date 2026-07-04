import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChefHat,
  ShoppingCart,
  History,
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  User,
  ClipboardList,
  Coffee,
  ChevronDown,
  AlertTriangle,
  Ruler,
  Database,
  ArrowLeftRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRoleNavItems } from "@/lib/auth/roles";
import type { UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChefHat,
  ShoppingCart,
  History,
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  User,
  ClipboardList,
  Ruler,
  Database,
  ArrowLeftRight,
  Settings,
};

interface AppSidebarProps {
  role: UserRole;
  lowStockCount?: number;
}

export function AppSidebar({ role, lowStockCount = 0 }: AppSidebarProps) {
  const pathname = useLocation().pathname;
  const navItems = getRoleNavItems(role);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Coffee className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-lg font-bold">CoffeeStock</h1>
          <p className="text-xs text-muted-foreground">Inventaris Kedai Kopi</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (item.children) {
              const isOpen =
                openGroups[item.title] ??
                item.children.some(
                  (c) => pathname === c.href || pathname.startsWith(c.href + "/")
                );
              const GroupIcon = iconMap[item.icon] || Database;

              return (
                <li key={item.title}>
                  <button
                    onClick={() => toggleGroup(item.title)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent"
                  >
                    <span className="flex items-center gap-2">
                      <GroupIcon className="h-4 w-4" />
                      {item.title}
                    </span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                    />
                  </button>
                  {isOpen && (
                    <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
                      {item.children.map((child) => {
                        const ChildIcon = iconMap[child.icon] || Package;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent",
                                pathname === child.href &&
                                  "bg-sidebar-accent font-medium text-sidebar-primary"
                              )}
                            >
                              <ChildIcon className="h-4 w-4 shrink-0" />
                              {child.title}
                              {child.href === "/master/barang" && lowStockCount > 0 && (
                                <Badge variant="destructive" className="ml-auto text-xs">
                                  {lowStockCount}
                                </Badge>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            const isActive = pathname === item.href;
            const Icon = iconMap[item.icon] || LayoutDashboard;

            return (
              <li key={item.href}>
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent text-sidebar-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                  {lowStockCount > 0 && item.href === "/" && (
                    <AlertTriangle className="ml-auto h-4 w-4 text-destructive" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
