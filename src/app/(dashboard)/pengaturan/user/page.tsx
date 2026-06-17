import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { UserManagementClient } from "@/components/pengaturan/user-client";

export default async function UserPage() {
  const profile = await requireRole(["owner"]);
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("*").order("created_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen User</h1>
        <p className="text-muted-foreground">Kelola role dan status pengguna</p>
      </div>
      <UserManagementClient users={users ?? []} currentUserId={profile.id} />
    </div>
  );
}
