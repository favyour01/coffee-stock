"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createUnit, updateUnit, deleteUnit } from "@/actions/units";
import { toast } from "sonner";
import type { Unit } from "@/types";

export function SatuanClient({ units }: { units: Unit[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState({ nama: "", singkatan: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = editing
      ? await updateUnit(editing.id, form)
      : await createUnit(form);
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setEditing(null);
              setForm({ nama: "", singkatan: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Satuan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Tambah"} Satuan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nama Satuan</Label>
                <Input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Kilogram"
                  required
                />
              </div>
              <div>
                <Label>Singkatan</Label>
                <Input
                  value={form.singkatan}
                  onChange={(e) => setForm({ ...form, singkatan: e.target.value })}
                  placeholder="Contoh: Kg"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Singkatan</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>{unit.nama}</TableCell>
                <TableCell className="font-mono">{unit.singkatan}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(unit)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(unit.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {units.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Belum ada satuan. Tambahkan pcs, Kg, Liter, dll.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
