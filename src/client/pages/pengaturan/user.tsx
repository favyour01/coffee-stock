import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { UserClient } from "@/components/pengaturan/user-client";
import { PageHeader } from "@/components/layout/page-header";

export function UserPage() {
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: userApi.list });
  return (
    <div className="space-y-6">
      <PageHeader title="Kelola User" description="Atur akun dan role pengguna" />
      <UserClient users={users} />
    </div>
  );
}
