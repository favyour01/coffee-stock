import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { dashboardApi } from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export function DashboardLayout() {
  const { user } = useAuth();
  const { data: lowStockProducts } = useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: dashboardApi.lowStock,
    staleTime: 60_000,
  });

  if (!user) return null;

  return (
    <DashboardShell profile={user} lowStockCount={lowStockProducts?.length ?? 0}>
      <Outlet />
    </DashboardShell>
  );
}
