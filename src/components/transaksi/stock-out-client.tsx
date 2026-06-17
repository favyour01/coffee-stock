"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createStockOut } from "@/actions/stock";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { Product, StockOut } from "@/types";
import { format } from "date-fns";

export function StockOutClient({
  products,
  history,
}: {
  products: Product[];
  history: StockOut[];
}) {
  const [form, setForm] = useState({
    tanggal: format(new Date(), "yyyy-MM-dd"),
    product_id: "",
    qty: 1,
    keterangan: "",
  });
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === form.product_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await createStockOut(form);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Barang keluar berhasil dicatat");
      setForm({ ...form, qty: 1, keterangan: "", product_id: "" });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Form Barang Keluar</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Tanggal</Label><Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required /></div>
            <div>
              <Label>Barang</Label>
              <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Pilih barang" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nama_barang} (Stok: {p.stok} {p.satuan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Stok tersedia: {selectedProduct.stok} {selectedProduct.satuan}
              </p>
            )}
            <div><Label>Qty</Label><Input type="number" min={0.001} step="0.001" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} required /></div>
            <div><Label>Keterangan</Label><Textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} placeholder="Contoh: Pemakaian harian" /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Menyimpan..." : "Simpan"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Riwayat Terbaru</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.slice(0, 10).map((h) => (
                <TableRow key={h.id}>
                  <TableCell>{formatDate(h.tanggal)}</TableCell>
                  <TableCell>{h.products?.nama_barang}</TableCell>
                  <TableCell>{h.qty}</TableCell>
                  <TableCell>{h.keterangan ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
