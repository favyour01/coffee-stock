import { requireAuth } from "@/lib/auth/session";
import { ProfilClient } from "@/components/pengaturan/profil-client";

export default async function ProfilPage() {
  const profile = await requireAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground">Kelola profil Anda</p>
      </div>
      <ProfilClient profile={profile} />
    </div>
  );
}
