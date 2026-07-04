import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FormGrid, FormStack } from "@/components/ui/field";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { stockApi } from "@/lib/api";
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
  const qc = useQueryClient();
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
    try {
      await stockApi.inCreate(form);
      toast.success("Barang masuk berhasil dicatat");
      qc.invalidateQueries({ queryKey: ["stock-in"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setForm({ ...form, qty: 1, harga_beli: 0, product_id: "" });
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };

  const historyColumns = useMemo<DataTableColumn<StockIn>[]>(
    () => [
      { id: "tanggal", header: "Tanggal", sortable: true, sortValue: (h) => h.tanggal, cell: (h) => formatDate(h.tanggal) },
      { id: "barang", header: "Barang", sortable: true, sortValue: (h) => h.product_nama ?? h.products?.nama_barang ?? "", cell: (h) => h.product_nama ?? h.products?.nama_barang ?? "-" },
      { id: "qty", header: "Qty", sortable: true, sortValue: (h) => Number(h.qty), cell: (h) => h.qty },
      { id: "total", header: "Total", sortable: true, sortValue: (h) => Number(h.qty) * Number(h.harga_beli), cell: (h) => formatCurrency(Number(h.qty) * Number(h.harga_beli)) },
    ],
    []
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Form Barang Masuk</CardTitle></CardHeader>
        <CardContent>
          <FormStack onSubmit={handleSubmit}>
            <Field label="Tanggal">
              <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required />
            </Field>
            <Field label="Supplier">
              <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Barang">
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
            </Field>
            {selectedProduct && (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Stok saat ini: <span className="font-medium text-foreground">{selectedProduct.stok} {selectedProduct.satuan}</span>
              </p>
            )}
            <FormGrid>
              <Field label={`Qty (${selectedProduct?.satuan ?? "satuan"})`}>
                <Input type="number" min={0.001} step="0.001" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} required />
              </Field>
              <Field label="Harga Beli">
                <Input type="number" min={0} value={form.harga_beli} onChange={(e) => setForm({ ...form, harga_beli: Number(e.target.value) })} required />
              </Field>
            </FormGrid>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{formatCurrency(total)}</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Menyimpan..." : "Simpan"}</Button>
          </FormStack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Riwayat Terbaru</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            data={history}
            columns={historyColumns}
            getRowKey={(h) => h.id}
            searchPlaceholder="Cari barang..."
            searchFilter={(h, q) => (h.products?.nama_barang ?? "").toLowerCase().includes(q)}
            emptyMessage="Belum ada riwayat barang masuk"
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
