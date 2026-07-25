import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, DialogForm } from "@/components/ui/field";
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
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { recipeApi } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency, numericDraftValue, toNumericDraft, type NumericDraft } from "@/lib/utils";
import type { Recipe, Product } from "@/types";

interface RecipeItemRow {
  product_id: string;
  qty: NumericDraft;
}

const emptyItem = (): RecipeItemRow => ({ product_id: "", qty: 1 });

export function ProduksiClient({
  recipes,
  products,
}: {
  recipes: Recipe[];
  products: Product[];
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [namaMenu, setNamaMenu] = useState("");
  const [hargaJual, setHargaJual] = useState<NumericDraft>(0);
  const [items, setItems] = useState<RecipeItemRow[]>([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const reset = () => {
    setEditing(null);
    setNamaMenu("");
    setHargaJual(0);
    setItems([emptyItem()]);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const recipeItems = (recipe: Recipe) => recipe.items ?? [];

  const handleEdit = (recipe: Recipe) => {
    const currentItems = recipeItems(recipe);
    setEditing(recipe);
    setNamaMenu(recipe.nama_menu);
    setHargaJual(Number(recipe.harga_jual));
    setItems(
      currentItems.length > 0
        ? currentItems.map((i) => ({ product_id: i.product_id, qty: Number(i.qty) }))
        : [emptyItem()]
    );
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hargaJual === "") {
      toast.error("Harga jual wajib diisi");
      return;
    }
    if (hargaJual < 0) {
      toast.error("Harga jual tidak boleh negatif");
      return;
    }

    const validItems = items
      .filter((i) => i.product_id && i.qty !== "" && i.qty > 0)
      .map((i) => ({ product_id: i.product_id, qty: Number(i.qty) }));

    if (validItems.length === 0) {
      toast.error("Tambahkan minimal 1 bahan dengan qty lebih dari 0");
      return;
    }

    const incomplete = items.some(
      (i) => i.product_id && (i.qty === "" || i.qty <= 0)
    );
    if (incomplete) {
      toast.error("Qty bahan tidak boleh kosong atau 0");
      return;
    }

    setLoading(true);
    const data = { nama_menu: namaMenu, harga_jual: Number(hargaJual), items: validItems };
    try {
      if (editing) await recipeApi.update(editing.id, data);
      else await recipeApi.create(data);
      toast.success(editing ? "Resep diperbarui" : "Resep ditambahkan");
      qc.invalidateQueries({ queryKey: ["recipes"] });
      setOpen(false);
      reset();
    } catch (err) { toast.error((err as Error).message); }
    finally { setLoading(false); }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => reset()}>
              <Plus className="mr-2 h-4 w-4" />Tambah Resep
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Tambah"} Resep Produk</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto">
              <DialogForm onSubmit={handleSubmit}>
                <Field label="Nama Menu">
                  <Input value={namaMenu} onChange={(e) => setNamaMenu(e.target.value)} placeholder="Es Kopi Susu" required />
                </Field>
                <Field label="Harga Jual">
                  <Input
                    type="number"
                    min={0}
                    value={numericDraftValue(hargaJual)}
                    onChange={(e) => setHargaJual(toNumericDraft(e.target.value))}
                  />
                </Field>
                <Field label="Bahan-bahan">
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Select
                          value={item.product_id || undefined}
                          onValueChange={(v) => {
                            const newItems = [...items];
                            newItems[idx] = { ...newItems[idx], product_id: v };
                            setItems(newItems);
                          }}
                        >
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Pilih bahan" /></SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.nama_barang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={0.001}
                          step="0.001"
                          className="w-28"
                          value={numericDraftValue(item.qty)}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[idx] = { ...newItems[idx], qty: toNumericDraft(e.target.value) };
                            setItems(newItems);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, emptyItem()])}>
                      <Plus className="mr-1 h-3 w-3" />Tambah Bahan
                    </Button>
                  </div>
                </Field>
                <Button type="submit" disabled={loading} className="w-full">{loading ? "Menyimpan..." : "Simpan"}</Button>
              </DialogForm>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recipes.map((recipe) => {
          const itemsList = recipeItems(recipe);
          const isOpen = !!expanded[recipe.id];
          return (
            <Card key={recipe.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">{recipe.nama_menu}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCurrency(recipe.harga_jual)} · {itemsList.length} bahan
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={isOpen ? "Sembunyikan bahan" : "Tampilkan bahan"}
                    onClick={() => toggleExpand(recipe.id)}
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(recipe)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      if (!confirm("Hapus resep?")) return;
                      try {
                        await recipeApi.delete(recipe.id);
                        toast.success("Dihapus");
                        qc.invalidateQueries({ queryKey: ["recipes"] });
                      } catch (err) {
                        toast.error((err as Error).message);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {isOpen && (
                <CardContent>
                  {itemsList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada bahan pada resep ini.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bahan</TableHead>
                          <TableHead>Qty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itemsList.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product_nama ?? "-"}</TableCell>
                            <TableCell>
                              {item.qty} {item.satuan ?? ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
