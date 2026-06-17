"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createSupplier, updateSupplier, deleteSupplier } from "@/actions/suppliers";
import { toast } from "sonner";
import type { Supplier } from "@/types";

export function SupplierClient({ suppliers }: { suppliers: Supplier[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ nama: "", telepon: "", email: "", alamat: "", pic: "" });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm({ nama: "", telepon: "", email: "", alamat: "", pic: "" });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = editing
      ? await updateSupplier(editing.id, form)
      : await createSupplier(form);
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
    setForm({
      nama: s.nama,
      telepon: s.telepon ?? "",
      email: s.email ?? "",
      alamat: s.alamat ?? "",
      pic: s.pic ?? "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Tambah Supplier</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Tambah"} Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Nama</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></div>
              <div><Label>Telepon</Label><Input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>PIC</Label><Input value={form.pic} onChange={(e) => setForm({ ...form, pic: e.target.value })} /></div>
              <div><Label>Alamat</Label><Textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Menyimpan..." : "Simpan"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.nama}</TableCell>
                <TableCell>{s.telepon ?? "-"}</TableCell>
                <TableCell>{s.email ?? "-"}</TableCell>
                <TableCell>{s.pic ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={async () => {
                      if (!confirm("Hapus supplier?")) return;
                      const r = await deleteSupplier(s.id);
                      if (r.error) toast.error(r.error); else toast.success("Dihapus");
                    }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
