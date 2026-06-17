import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireAuth } from "@/lib/auth/session";
import { getLowStockCount } from "@/lib/queries/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth();
  const lowStockCount = await getLowStockCount();

  return (
    <DashboardShell profile={profile} lowStockCount={lowStockCount}>
      {children}
    </DashboardShell>
  );
}
