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
import { formatCurrency, formatDate } from "@/lib/utils";
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
  const [form, setForm] = useState({
    tanggal: format(new Date(), "yyyy-MM-dd"),
    recipe_id: "",
    qty: 1,
  });
  const [loading, setLoading] = useState(false);

  const selectedRecipe = recipes.find((r) => r.id === form.recipe_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saleApi.create(form);
      toast.success("Penjualan berhasil — stok bahan otomatis berkurang");
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setForm({ ...form, qty: 1, recipe_id: "" });
    } catch (e) { toast.error((e as Error).message); }
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
              <Select value={form.recipe_id} onValueChange={(v) => setForm({ ...form, recipe_id: v })} required>
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
                {selectedRecipe.recipe_items?.map((item) => (
                  <p key={item.id} className="text-muted-foreground">
                    {item.products?.nama_barang}: {Number(item.qty) * form.qty} {item.products?.satuan}
                  </p>
                ))}
              </div>
            )}
            <Field label="Jumlah">
              <Input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} required />
            </Field>
            {selectedRecipe && (
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{formatCurrency(selectedRecipe.harga_jual * form.qty)}</p>
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
            searchFilter={(h, q) => (h.recipes?.nama_menu ?? "").toLowerCase().includes(q)}
            emptyMessage="Belum ada riwayat penjualan"
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
