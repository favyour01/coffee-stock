import { useMemo, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
    if (!namaMenu.trim()) {
      toast.error("Nama menu wajib diisi");
      return;
    }
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

    const productIds = validItems.map((i) => i.product_id);
    if (new Set(productIds).size !== productIds.length) {
      toast.error("Bahan yang sama tidak boleh dipilih dua kali");
      return;
    }

    setLoading(true);
    const data = {
      nama_menu: namaMenu.trim(),
      harga_jual: Number(hargaJual),
      items: validItems,
    };
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

  const columns = useMemo<DataTableColumn<Recipe>[]>(
    () => [
      {
        id: "menu",
        header: "Menu",
        sortable: true,
        sortValue: (r) => r.nama_menu,
        cell: (r) => <span className="font-medium">{r.nama_menu}</span>,
      },
      {
        id: "harga",
        header: "Harga Jual",
        sortable: true,
        sortValue: (r) => Number(r.harga_jual),
        cell: (r) => formatCurrency(Number(r.harga_jual)),
      },
      {
        id: "bahan",
        header: "Bahan",
        sortable: true,
        sortValue: (r) => recipeItems(r).length,
        cell: (r) => {
          const list = recipeItems(r);
          if (list.length === 0) {
            return <span className="text-muted-foreground">Belum ada bahan</span>;
          }
          return (
            <div className="max-w-md space-y-0.5 text-sm">
              {list.map((item) => (
                <div key={item.id} className="text-muted-foreground">
                  <span className="text-foreground">{item.product_nama ?? "-"}</span>
                  {" · "}
                  {item.qty} {item.satuan ?? ""}
                </div>
              ))}
            </div>
          );
        },
      },
      {
        id: "jumlah",
        header: "Jml Bahan",
        sortable: true,
        sortValue: (r) => recipeItems(r).length,
        cell: (r) => recipeItems(r).length,
        headerClassName: "w-28",
      },
      {
        id: "aksi",
        header: "Aksi",
        headerClassName: "w-28",
        cell: (r) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (!confirm("Hapus resep?")) return;
                try {
                  await recipeApi.delete(r.id);
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
        ),
      },
    ],
    [qc]
  );

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

      <DataTable
        data={recipes}
        columns={columns}
        getRowKey={(r) => r.id}
        searchPlaceholder="Cari nama menu atau bahan..."
        searchFilter={(r, q) =>
          r.nama_menu.toLowerCase().includes(q) ||
          recipeItems(r).some((item) => (item.product_nama ?? "").toLowerCase().includes(q))
        }
        emptyMessage="Belum ada resep"
      />
    </div>
  );
}
