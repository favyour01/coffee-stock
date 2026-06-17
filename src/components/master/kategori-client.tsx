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
import { Field, FormStack } from "@/components/ui/field";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { toast } from "sonner";
import type { Category } from "@/types";

export function KategoriClient({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);

  const columns = useMemo<DataTableColumn<Category>[]>(
    () => [
      {
        id: "nama",
        header: "Nama Kategori",
        sortable: true,
        sortValue: (c) => c.nama,
        cell: (c) => c.nama,
      },
      {
        id: "aksi",
        header: "Aksi",
        headerClassName: "w-24",
        cell: (c) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
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
    const result = editing ? await updateCategory(editing.id, nama) : await createCategory(nama);
    setLoading(false);

    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Kategori diperbarui" : "Kategori ditambahkan");
      setOpen(false);
      setNama("");
      setEditing(null);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setNama(cat.nama);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    const result = await deleteCategory(id);
    if (result.error) toast.error(result.error);
    else toast.success("Kategori dihapus");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setNama(""); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Tambah Kategori</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Tambah"} Kategori</DialogTitle>
            </DialogHeader>
            <FormStack onSubmit={handleSubmit}>
              <Field label="Nama Kategori">
                <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Biji Kopi" required />
              </Field>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </FormStack>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        getRowKey={(c) => c.id}
        searchPlaceholder="Cari kategori..."
        searchFilter={(c, q) => c.nama.toLowerCase().includes(q)}
        emptyMessage="Belum ada kategori"
      />
    </div>
  );
}
