"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateUserRole, toggleUserActive } from "@/actions/users";
import { toast } from "sonner";
import { ROLES } from "@/lib/auth/roles";
import type { Profile, UserRole } from "@/types";

// Simple switch component if not from shadcn
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

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aktif</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.nama}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.id === currentUserId ? (
                  <Badge>{ROLES[user.role]}</Badge>
                ) : (
                  <Select
                    value={user.role}
                    onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}
                    disabled={loading === user.id}
                  >
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="kasir">Kasir</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? "secondary" : "destructive"}>
                  {user.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.id !== currentUserId && (
                  <ActiveSwitch
                    checked={user.is_active}
                    onChange={(v) => handleToggleActive(user.id, v)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
