import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Field, FormGrid, DialogForm } from "@/components/ui/field";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Plus, Pencil } from "lucide-react";
import { authApi, userApi } from "@/lib/api";
import { toast } from "sonner";
import { ROLES } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth/context";
import type { User, UserRole } from "@/types";

const ALL_ROLES: UserRole[] = ["owner", "admin", "stok", "kasir"];

const emptyForm = { nama: "", email: "", password: "", role: "kasir" as UserRole };

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

export function UserClient({ users }: { users: User[] }) {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

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

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setLoading(userId);
    try {
      await userApi.updateRole(userId, role);
      toast.success("Role diperbarui");
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(null); }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setLoading(userId);
    try {
      await userApi.updateStatus(userId, isActive);
      toast.success(isActive ? "User diaktifkan" : "User dinonaktifkan");
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(null); }
  };

  const handleEdit = (u: User) => {
    setEditing(u);
    setForm({ nama: u.nama, email: u.email, password: "", role: u.role });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editing) {
        await userApi.update(editing.id, { nama: form.nama, email: form.email });
        if (form.role !== editing.role) {
          await userApi.updateRole(editing.id, form.role);
        }
        if (form.password) {
          await userApi.resetPassword(editing.id, form.password);
        }
        toast.success("User diperbarui");
      } else {
        await authApi.register({
          nama: form.nama,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        toast.success("User ditambahkan");
      }
      qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      resetForm();
    } catch (e) { toast.error((e as Error).message); }
    finally { setFormLoading(false); }
  };

  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      { id: "nama", header: "Nama", sortable: true, sortValue: (u) => u.nama, cell: (u) => <span className="font-medium">{u.nama}</span> },
      { id: "email", header: "Email", sortable: true, sortValue: (u) => u.email, cell: (u) => u.email },
      {
        id: "role", header: "Role", sortable: true, sortValue: (u) => u.role,
        cell: (u) =>
          u.id === currentUser?.id ? (
            <Badge>{ROLES[u.role]}</Badge>
          ) : (
            <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v as UserRole)} disabled={loading === u.id}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLES[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
      },
      {
        id: "status", header: "Status",
        cell: (u) => <Badge variant={u.is_active ? "secondary" : "destructive"}>{u.is_active ? "Aktif" : "Nonaktif"}</Badge>,
      },
      {
        id: "aktif", header: "Aktif",
        cell: (u) => u.id !== currentUser?.id ? (
          <ActiveSwitch checked={Boolean(u.is_active)} onChange={(v) => handleToggleActive(u.id, v)} />
        ) : null,
      },
      {
        id: "aksi",
        header: "Aksi",
        headerClassName: "w-16",
        cell: (u) => (
          <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser?.id, loading]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <Button onClick={() => { resetForm(); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Tambah User
          </Button>
          <DialogContent className="p-0 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Tambah"} User</DialogTitle>
            </DialogHeader>
            <DialogForm onSubmit={handleSubmit}>
              <FormGrid>
                <Field label="Nama">
                  <Input
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Role">
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
                    disabled={editing?.id === currentUser?.id}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLES[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label={editing ? "Password Baru" : "Password"}
                  hint={editing ? "Kosongkan jika tidak ingin mengubah password" : undefined}
                >
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editing}
                    minLength={6}
                  />
                </Field>
              </FormGrid>
              <Button type="submit" disabled={formLoading} className="w-full">
                {formLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogForm>
          </DialogContent>
        </Dialog>
      </div>

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
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLES[r]}</SelectItem>
                ))}
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
    </div>
  );
}
