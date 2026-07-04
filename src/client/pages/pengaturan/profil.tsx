import { useAuth } from "@/lib/auth/context";
import { ProfilClient } from "@/components/pengaturan/profil-client";
import { PageHeader } from "@/components/layout/page-header";

export function ProfilPage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <PageHeader title="Profil" description="Kelola informasi akun Anda" />
      <ProfilClient profile={user} />
    </div>
  );
}
