"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FormGrid, DialogForm } from "@/components/ui/field";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createSupplier, updateSupplier, deleteSupplier } from "@/actions/suppliers";
import { toast } from "sonner";
import type { Supplier } from "@/types";

export function SupplierClient({ suppliers }: { suppliers: Supplier[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ nama: "", telepon: "", email: "", alamat: "", pic: "" });
  const [loading, setLoading] = useState(false);

  const columns = useMemo<DataTableColumn<Supplier>[]>(
    () => [
      { id: "nama", header: "Nama", sortable: true, sortValue: (s) => s.nama, cell: (s) => <span className="font-medium">{s.nama}</span> },
      { id: "telepon", header: "Telepon", sortable: true, sortValue: (s) => s.telepon ?? "", cell: (s) => s.telepon ?? "-" },
      { id: "email", header: "Email", sortable: true, sortValue: (s) => s.email ?? "", cell: (s) => s.email ?? "-" },
      { id: "pic", header: "PIC", sortable: true, sortValue: (s) => s.pic ?? "", cell: (s) => s.pic ?? "-" },
      {
        id: "aksi",
        header: "Aksi",
        headerClassName: "w-24",
        cell: (s) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={async () => {
              if (!confirm("Hapus supplier?")) return;
              const r = await deleteSupplier(s.id);
              if (r.error) toast.error(r.error); else toast.success("Dihapus");
            }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const resetForm = () => {
    setForm({ nama: "", telepon: "", email: "", alamat: "", pic: "" });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = editing ? await updateSupplier(editing.id, form) : await createSupplier(form);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Supplier diperbarui" : "Supplier ditambahkan");
      setOpen(false);
      resetForm();
    }
  };

  const handleEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ nama: s.nama, telepon: s.telepon ?? "", email: s.email ?? "", alamat: s.alamat ?? "", pic: s.pic ?? "" });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Tambah Supplier</Button>
          </DialogTrigger>
          <DialogContent className="p-0 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Tambah"} Supplier</DialogTitle>
            </DialogHeader>
            <DialogForm onSubmit={handleSubmit}>
              <FormGrid>
                <Field label="Nama"><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></Field>
                <Field label="Telepon"><Input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} /></Field>
                <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label="PIC"><Input value={form.pic} onChange={(e) => setForm({ ...form, pic: e.target.value })} /></Field>
              </FormGrid>
              <Field label="Alamat"><Textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></Field>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Menyimpan..." : "Simpan"}</Button>
            </DialogForm>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={suppliers}
        columns={columns}
        getRowKey={(s) => s.id}
        searchPlaceholder="Cari supplier..."
        searchFilter={(s, q) =>
          s.nama.toLowerCase().includes(q) ||
          (s.telepon ?? "").includes(q) ||
          (s.email ?? "").toLowerCase().includes(q) ||
          (s.pic ?? "").toLowerCase().includes(q)
        }
        emptyMessage="Belum ada supplier"
      />
    </div>
  );
}
