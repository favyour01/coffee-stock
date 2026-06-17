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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSale } from "@/actions/recipes";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Recipe, Sale } from "@/types";
import { format } from "date-fns";

export function PenjualanClient({
  recipes,
  history,
}: {
  recipes: Recipe[];
  history: Sale[];
}) {
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
    const result = await createSale(form);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Penjualan berhasil — stok bahan otomatis berkurang");
      setForm({ ...form, qty: 1, recipe_id: "" });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Form Penjualan (Kasir)</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Tanggal</Label><Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required /></div>
            <div>
              <Label>Menu</Label>
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
            </div>
            {selectedRecipe && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Bahan yang akan berkurang:</p>
                {selectedRecipe.recipe_items?.map((item) => (
                  <p key={item.id} className="text-muted-foreground">
                    {item.products?.nama_barang}: {Number(item.qty) * form.qty} {item.products?.satuan}
                  </p>
                ))}
              </div>
            )}
            <div><Label>Jumlah</Label><Input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} required /></div>
            {selectedRecipe && (
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-sm">Total</p>
                <p className="text-xl font-bold">{formatCurrency(selectedRecipe.harga_jual * form.qty)}</p>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Memproses..." : "Catat Penjualan"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Riwayat Penjualan</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead>Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.slice(0, 10).map((h) => (
                <TableRow key={h.id}>
                  <TableCell>{formatDate(h.tanggal)}</TableCell>
                  <TableCell>{h.recipes?.nama_menu}</TableCell>
                  <TableCell>{h.qty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
