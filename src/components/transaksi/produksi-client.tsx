"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createRecipe, updateRecipe, deleteRecipe } from "@/actions/recipes";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { Recipe, Product } from "@/types";

interface RecipeItemRow {
  product_id: string;
  qty: number;
}

export function ProduksiClient({
  recipes,
  products,
}: {
  recipes: Recipe[];
  products: Product[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [namaMenu, setNamaMenu] = useState("");
  const [hargaJual, setHargaJual] = useState(0);
  const [items, setItems] = useState<RecipeItemRow[]>([{ product_id: "", qty: 1 }]);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEditing(null);
    setNamaMenu("");
    setHargaJual(0);
    setItems([{ product_id: "", qty: 1 }]);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditing(recipe);
    setNamaMenu(recipe.nama_menu);
    setHargaJual(recipe.harga_jual);
    setItems(
      recipe.recipe_items?.map((i) => ({
        product_id: i.product_id,
        qty: i.qty,
      })) ?? [{ product_id: "", qty: 1 }]
    );
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.product_id && i.qty > 0);
    if (validItems.length === 0) {
      toast.error("Tambahkan minimal 1 bahan");
      return;
    }
    setLoading(true);
    const data = { nama_menu: namaMenu, harga_jual: hargaJual, items: validItems };
    const result = editing
      ? await updateRecipe(editing.id, data)
      : await createRecipe(data);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Resep diperbarui" : "Resep ditambahkan");
      setOpen(false);
      reset();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Tambah Resep</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Tambah"} Resep Produk</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nama Menu</Label><Input value={namaMenu} onChange={(e) => setNamaMenu(e.target.value)} placeholder="Es Kopi Susu" required /></div>
              <div><Label>Harga Jual</Label><Input type="number" min={0} value={hargaJual} onChange={(e) => setHargaJual(Number(e.target.value))} /></div>
              <div className="space-y-2">
                <Label>Bahan-bahan</Label>
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Select value={item.product_id} onValueChange={(v) => {
                      const newItems = [...items];
                      newItems[idx].product_id = v;
                      setItems(newItems);
                    }}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Pilih bahan" /></SelectTrigger>
                      <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.nama_barang}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" min={0.001} step="0.001" className="w-24" value={item.qty} onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].qty = Number(e.target.value);
                      setItems(newItems);
                    }} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { product_id: "", qty: 1 }])}>
                  <Plus className="mr-1 h-3 w-3" />Tambah Bahan
                </Button>
              </div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Menyimpan..." : "Simpan"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{recipe.nama_menu}</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(recipe)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={async () => {
                  if (!confirm("Hapus resep?")) return;
                  const r = await deleteRecipe(recipe.id);
                  if (r.error) toast.error(r.error); else toast.success("Dihapus");
                }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-muted-foreground">Harga: {formatCurrency(recipe.harga_jual)}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bahan</TableHead>
                    <TableHead>Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipe.recipe_items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.products?.nama_barang}</TableCell>
                      <TableCell>{item.qty} {item.products?.satuan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
