import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/context";
import { ProfilClient } from "@/components/pengaturan/profil-client";
import { PageHeader } from "@/components/layout/page-header";

export function ProfilPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="space-y-6">
      <PageHeader title="Profil" description="Kelola informasi akun Anda" />
      <ProfilClient profile={user} />
    </div>
  );
}
