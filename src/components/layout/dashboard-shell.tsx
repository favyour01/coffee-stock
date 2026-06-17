import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import type { Profile } from "@/types";

interface DashboardShellProps {
  profile: Profile;
  lowStockCount?: number;
  children: React.ReactNode;
}

export function DashboardShell({ profile, lowStockCount, children }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <AppSidebar role={profile.role} lowStockCount={lowStockCount} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader profile={profile} lowStockCount={lowStockCount} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
