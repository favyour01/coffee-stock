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
import { Field, FormStack } from "@/components/ui/field";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { stockApi } from "@/lib/api";
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
  const qc = useQueryClient();
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
    try {
      await stockApi.outCreate(form);
      toast.success("Barang keluar berhasil dicatat");
      qc.invalidateQueries({ queryKey: ["stock-out"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setForm({ ...form, qty: 1, keterangan: "", product_id: "" });
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };

  const historyColumns = useMemo<DataTableColumn<StockOut>[]>(
    () => [
      { id: "tanggal", header: "Tanggal", sortable: true, sortValue: (h) => h.tanggal, cell: (h) => formatDate(h.tanggal) },
      { id: "barang", header: "Barang", sortable: true, sortValue: (h) => h.product_nama ?? h.products?.nama_barang ?? "", cell: (h) => h.product_nama ?? h.products?.nama_barang ?? "-" },
      { id: "qty", header: "Qty", sortable: true, sortValue: (h) => Number(h.qty), cell: (h) => h.qty },
      { id: "keterangan", header: "Keterangan", sortable: true, sortValue: (h) => h.keterangan ?? "", cell: (h) => h.keterangan ?? "-" },
    ],
    []
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Form Barang Keluar</CardTitle></CardHeader>
        <CardContent>
          <FormStack onSubmit={handleSubmit}>
            <Field label="Tanggal">
              <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required />
            </Field>
            <Field label="Barang">
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
            </Field>
            {selectedProduct && (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Stok tersedia: <span className="font-medium text-foreground">{selectedProduct.stok} {selectedProduct.satuan}</span>
              </p>
            )}
            <Field label={`Qty (${selectedProduct?.satuan ?? "satuan"})`}>
              <Input type="number" min={0.001} step="0.001" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} required />
            </Field>
            <Field label="Keterangan" hint="Opsional — contoh: pemakaian harian">
              <Textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} placeholder="Contoh: Pemakaian harian" />
            </Field>
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
            searchPlaceholder="Cari barang atau keterangan..."
            searchFilter={(h, q) =>
              (h.products?.nama_barang ?? "").toLowerCase().includes(q) ||
              (h.keterangan ?? "").toLowerCase().includes(q)
            }
            emptyMessage="Belum ada riwayat barang keluar"
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
