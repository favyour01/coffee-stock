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
import { createStockIn } from "@/actions/stock";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product, Supplier, StockIn } from "@/types";
import { format } from "date-fns";

interface StockInClientProps {
  products: Product[];
  suppliers: Supplier[];
  history: StockIn[];
}

export function StockInClient({ products, suppliers, history }: StockInClientProps) {
  const [form, setForm] = useState({
    tanggal: format(new Date(), "yyyy-MM-dd"),
    supplier_id: "",
    product_id: "",
    qty: 1,
    harga_beli: 0,
  });
  const [loading, setLoading] = useState(false);

  const total = form.qty * form.harga_beli;

  const selectedProduct = products.find((p) => p.id === form.product_id);

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setForm({
      ...form,
      product_id: productId,
      harga_beli: product?.harga_beli ?? 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await createStockIn(form);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Barang masuk berhasil dicatat");
      setForm({ ...form, qty: 1, harga_beli: 0, product_id: "" });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Form Barang Masuk</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Tanggal</Label><Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required /></div>
            <div>
              <Label>Supplier</Label>
              <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Barang</Label>
              <Select value={form.product_id} onValueChange={handleProductChange} required>
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
                Stok saat ini: {selectedProduct.stok} {selectedProduct.satuan}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Qty ({selectedProduct?.satuan ?? "satuan"})</Label>
                <Input type="number" min={0.001} step="0.001" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} required />
              </div>
              <div><Label>Harga Beli</Label><Input type="number" min={0} value={form.harga_beli} onChange={(e) => setForm({ ...form, harga_beli: Number(e.target.value) })} required /></div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{formatCurrency(total)}</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Menyimpan..." : "Simpan"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Riwayat Terbaru</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.slice(0, 10).map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{formatDate(h.tanggal)}</TableCell>
                    <TableCell>{h.products?.nama_barang}</TableCell>
                    <TableCell>{h.qty}</TableCell>
                    <TableCell>{formatCurrency(Number(h.qty) * Number(h.harga_beli))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
