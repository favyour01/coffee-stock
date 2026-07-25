import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FormStack } from "@/components/ui/field";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { saleApi } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency, formatDate, numericDraftValue, toNumericDraft, type NumericDraft } from "@/lib/utils";
import type { Recipe, Sale } from "@/types";
import { format } from "date-fns";

export function PenjualanClient({
  recipes,
  sales,
}: {
  recipes: Recipe[];
  sales: Sale[];
}) {
  const qc = useQueryClient();
  const riwayat = sales;
  const [form, setForm] = useState<{
    tanggal: string;
    recipe_id: string;
    qty: NumericDraft;
  }>({
    tanggal: format(new Date(), "yyyy-MM-dd"),
    recipe_id: "",
    qty: 1,
  });
  const [loading, setLoading] = useState(false);

  const selectedRecipe = recipes.find((r) => r.id === form.recipe_id);
  const recipeItems = selectedRecipe?.items ?? [];
  const qtyNumber = form.qty === "" ? 0 : form.qty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipe_id) {
      toast.error("Pilih menu terlebih dahulu");
      return;
    }
    if (form.qty === "" || !Number.isInteger(form.qty) || form.qty < 1) {
      toast.error("Jumlah harus bilangan bulat minimal 1");
      return;
    }

    setLoading(true);
    try {
      await saleApi.create({
        tanggal: form.tanggal,
        recipe_id: form.recipe_id,
        qty: form.qty,
      });
      toast.success("Penjualan berhasil — stok bahan otomatis berkurang");
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setForm({ ...form, qty: 1, recipe_id: "" });
    } catch (err) { toast.error((err as Error).message); }
    finally { setLoading(false); }
  };

  const historyColumns = useMemo<DataTableColumn<Sale>[]>(
    () => [
      { id: "tanggal", header: "Tanggal", sortable: true, sortValue: (h) => h.tanggal, cell: (h) => formatDate(h.tanggal) },
      { id: "menu", header: "Menu", sortable: true, sortValue: (h) => h.recipe_nama ?? h.recipes?.nama_menu ?? "", cell: (h) => h.recipe_nama ?? h.recipes?.nama_menu ?? "-" },
      { id: "qty", header: "Qty", sortable: true, sortValue: (h) => h.qty, cell: (h) => h.qty },
    ],
    []
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Form Penjualan (Kasir)</CardTitle></CardHeader>
        <CardContent>
          <FormStack onSubmit={handleSubmit}>
            <Field label="Tanggal">
              <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required />
            </Field>
            <Field label="Menu">
              <Select
                value={form.recipe_id || undefined}
                onValueChange={(v) => setForm({ ...form, recipe_id: v })}
                required
              >
                <SelectTrigger><SelectValue placeholder="Pilih menu" /></SelectTrigger>
                <SelectContent>
                  {recipes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.nama_menu} — {formatCurrency(r.harga_jual)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {selectedRecipe && (
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="mb-2 font-medium">Bahan yang akan berkurang:</p>
                {recipeItems.length === 0 ? (
                  <p className="text-muted-foreground">Resep ini belum memiliki bahan.</p>
                ) : (
                  recipeItems.map((item) => (
                    <p key={item.id} className="text-muted-foreground">
                      {item.product_nama}: {Number(item.qty) * qtyNumber} {item.satuan}
                    </p>
                  ))
                )}
              </div>
            )}
            <Field label="Jumlah">
              <Input
                type="number"
                min={1}
                step={1}
                value={numericDraftValue(form.qty)}
                onChange={(e) => setForm({ ...form, qty: toNumericDraft(e.target.value) })}
                required
              />
            </Field>
            {selectedRecipe && (
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{formatCurrency(selectedRecipe.harga_jual * qtyNumber)}</p>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Memproses..." : "Catat Penjualan"}</Button>
          </FormStack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Riwayat Penjualan</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            data={riwayat}
            columns={historyColumns}
            getRowKey={(h) => h.id}
            searchPlaceholder="Cari menu..."
            searchFilter={(h, q) =>
              (h.recipe_nama ?? h.recipes?.nama_menu ?? "").toLowerCase().includes(q)
            }
            emptyMessage="Belum ada riwayat penjualan"
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
