"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { updateUserRole, toggleUserActive } from "@/actions/users";
import { toast } from "sonner";
import { ROLES } from "@/lib/auth/roles";
import type { Profile, UserRole } from "@/types";

function ActiveSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function UserManagementClient({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const tableData = useMemo(() => {
    return users.filter((u) => {
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "aktif" && u.is_active) ||
        (filterStatus === "nonaktif" && !u.is_active);
      return matchRole && matchStatus;
    });
  }, [users, filterRole, filterStatus]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setLoading(userId);
    const result = await updateUserRole(userId, role);
    setLoading(null);
    if (result.error) toast.error(result.error);
    else toast.success("Role diperbarui");
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setLoading(userId);
    const result = await toggleUserActive(userId, isActive);
    setLoading(null);
    if (result.error) toast.error(result.error);
    else toast.success(isActive ? "User diaktifkan" : "User dinonaktifkan");
  };

  const columns = useMemo<DataTableColumn<Profile>[]>(
    () => [
      { id: "nama", header: "Nama", sortable: true, sortValue: (u) => u.nama, cell: (u) => <span className="font-medium">{u.nama}</span> },
      { id: "email", header: "Email", sortable: true, sortValue: (u) => u.email, cell: (u) => u.email },
      {
        id: "role",
        header: "Role",
        sortable: true,
        sortValue: (u) => u.role,
        cell: (u) =>
          u.id === currentUserId ? (
            <Badge>{ROLES[u.role]}</Badge>
          ) : (
            <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v as UserRole)} disabled={loading === u.id}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="kasir">Kasir</SelectItem>
              </SelectContent>
            </Select>
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: (u) => (
          <Badge variant={u.is_active ? "secondary" : "destructive"}>
            {u.is_active ? "Aktif" : "Nonaktif"}
          </Badge>
        ),
      },
      {
        id: "aktif",
        header: "Aktif",
        cell: (u) =>
          u.id !== currentUserId ? (
            <ActiveSwitch checked={u.is_active} onChange={(v) => handleToggleActive(u.id, v)} />
          ) : null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId, loading]
  );

  return (
    <DataTable
      data={tableData}
      columns={columns}
      getRowKey={(u) => u.id}
      searchPlaceholder="Cari nama atau email..."
      searchFilter={(u, q) => u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)}
      emptyMessage="Belum ada user"
      filters={
        <>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="kasir">Kasir</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    />
  );
}
