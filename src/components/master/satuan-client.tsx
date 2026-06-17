"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createUnit, updateUnit, deleteUnit } from "@/actions/units";
import { toast } from "sonner";
import type { Unit } from "@/types";

export function SatuanClient({ units }: { units: Unit[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState({ nama: "", singkatan: "" });
  const [loading, setLoading] = useState(false);

  const columns = useMemo<DataTableColumn<Unit>[]>(
    () => [
      { id: "nama", header: "Nama", sortable: true, sortValue: (u) => u.nama, cell: (u) => u.nama },
      { id: "singkatan", header: "Singkatan", sortable: true, sortValue: (u) => u.singkatan, cell: (u) => <span className="font-mono">{u.singkatan}</span> },
      {
        id: "aksi",
        header: "Aksi",
        headerClassName: "w-24",
        cell: (u) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = editing ? await updateUnit(editing.id, form) : await createUnit(form);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Satuan diperbarui" : "Satuan ditambahkan");
      setOpen(false);
      setForm({ nama: "", singkatan: "" });
      setEditing(null);
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditing(unit);
    setForm({ nama: unit.nama, singkatan: unit.singkatan });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus satuan ini?")) return;
    const result = await deleteUnit(id);
    if (result.error) toast.error(result.error);
    else toast.success("Satuan dihapus");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ nama: "", singkatan: "" }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Tambah Satuan</Button>
          </DialogTrigger>
          <DialogContent className="p-0 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Tambah"} Satuan</DialogTitle>
            </DialogHeader>
            <DialogForm onSubmit={handleSubmit}>
              <FormGrid>
                <Field label="Nama Satuan"><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Kilogram" required /></Field>
                <Field label="Singkatan"><Input value={form.singkatan} onChange={(e) => setForm({ ...form, singkatan: e.target.value })} placeholder="Contoh: Kg" required /></Field>
              </FormGrid>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Menyimpan..." : "Simpan"}</Button>
            </DialogForm>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={units}
        columns={columns}
        getRowKey={(u) => u.id}
        searchPlaceholder="Cari satuan..."
        searchFilter={(u, q) => u.nama.toLowerCase().includes(q) || u.singkatan.toLowerCase().includes(q)}
        emptyMessage="Belum ada satuan"
      />
    </div>
  );
}
