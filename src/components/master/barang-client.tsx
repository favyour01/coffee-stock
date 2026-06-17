"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FormGrid, FormStack } from "@/components/ui/field";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2, QrCode, ScanLine } from "lucide-react";
import { createProduct, updateProduct, deleteProduct, generateAndUploadQR } from "@/actions/products";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { Product, Category, Supplier, Unit } from "@/types";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import Image from "next/image";

interface BarangClientProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  units: Unit[];
  canEdit: boolean;
}

const emptyForm = {
  kode_barang: "",
  nama_barang: "",
  kategori_id: "",
  supplier_id: "",
  satuan: "pcs",
  harga_beli: 0,
  harga_jual: 0,
  minimum_stok: 0,
};

export function BarangClient({ products, categories, suppliers, units, canEdit }: BarangClientProps) {
  const [open, setOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterStok, setFilterStok] = useState("all");
  const [loading, setLoading] = useState(false);

  const tableData = useMemo(() => {
    return products.filter((p) => {
      const matchKategori = filterKategori === "all" || p.kategori_id === filterKategori;
      const matchStok =
        filterStok === "all" ||
        (filterStok === "menipis" && p.stok < p.minimum_stok) ||
        (filterStok === "aman" && p.stok >= p.minimum_stok);
      return matchKategori && matchStok;
    });
  }, [products, filterKategori, filterStok]);

  const columns = useMemo<DataTableColumn<Product>[]>(() => {
    const cols: DataTableColumn<Product>[] = [
      {
        id: "kode",
        header: "Kode",
        sortable: true,
        sortValue: (p) => p.kode_barang,
        cell: (p) => <span className="font-mono text-sm">{p.kode_barang}</span>,
      },
      {
        id: "nama",
        header: "Nama",
        sortable: true,
        sortValue: (p) => p.nama_barang,
        cell: (p) => <span className="font-medium">{p.nama_barang}</span>,
      },
      {
        id: "kategori",
        header: "Kategori",
        sortable: true,
        sortValue: (p) => p.categories?.nama ?? "",
        cell: (p) => p.categories?.nama ?? "-",
      },
      {
        id: "stok",
        header: "Stok",
        sortable: true,
        sortValue: (p) => p.stok,
        cell: (p) => `${p.stok} ${p.satuan}`,
      },
      {
        id: "harga",
        header: "Harga Beli",
        sortable: true,
        sortValue: (p) => p.harga_beli,
        cell: (p) => formatCurrency(p.harga_beli),
      },
      {
        id: "status",
        header: "Status",
        cell: (p) =>
          p.stok < p.minimum_stok ? (
            <Badge variant="destructive">Stok Menipis</Badge>
          ) : (
            <Badge variant="secondary">Aman</Badge>
          ),
      },
    ];

    if (canEdit) {
      cols.push({
        id: "aksi",
        header: "Aksi",
        headerClassName: "w-32",
        cell: (p) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (p.qr_code_url) {
                  setSelectedProduct(p);
                  setQrOpen(true);
                } else {
                  handleGenerateQR(p);
                }
              }}
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (!confirm("Hapus barang?")) return;
                const r = await deleteProduct(p.id);
                if (r.error) toast.error(r.error);
                else toast.success("Dihapus");
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      });
    }

    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...form,
      kategori_id: form.kategori_id || null,
      supplier_id: form.supplier_id || null,
    };
    const result = editing ? await updateProduct(editing.id, data) : await createProduct(data);
    setLoading(false);

    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Barang diperbarui" : "Barang ditambahkan");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    }
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      kode_barang: p.kode_barang,
      nama_barang: p.nama_barang,
      kategori_id: p.kategori_id ?? "",
      supplier_id: p.supplier_id ?? "",
      satuan: p.satuan,
      harga_beli: p.harga_beli,
      harga_jual: p.harga_jual,
      minimum_stok: p.minimum_stok,
    });
    setOpen(true);
  };

  const handleGenerateQR = async (product: Product) => {
    const result = await generateAndUploadQR(product.id, product.kode_barang);
    if (result.error) toast.error(result.error);
    else {
      toast.success("QR Code berhasil dibuat");
      setSelectedProduct({ ...product, qr_code_url: result.url ?? null });
      setQrOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setScanOpen(true)}>
          <ScanLine className="mr-2 h-4 w-4" />
          Scan
        </Button>
        {canEdit && (
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) {
                setEditing(null);
                setForm(emptyForm);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Barang
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "Tambah"} Barang</DialogTitle>
              </DialogHeader>
              <FormStack onSubmit={handleSubmit}>
                <FormGrid>
                  <Field label="Kode Barang">
                    <Input value={form.kode_barang} onChange={(e) => setForm({ ...form, kode_barang: e.target.value })} required />
                  </Field>
                  <Field label="Nama Barang">
                    <Input value={form.nama_barang} onChange={(e) => setForm({ ...form, nama_barang: e.target.value })} required />
                  </Field>
                  <Field label="Kategori">
                    <Select value={form.kategori_id} onValueChange={(v) => setForm({ ...form, kategori_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Supplier">
                    <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                      <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Satuan">
                    {units.length > 0 ? (
                      <Select value={form.satuan} onValueChange={(v) => setForm({ ...form, satuan: v })} required>
                        <SelectTrigger><SelectValue placeholder="Pilih satuan" /></SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u.id} value={u.singkatan}>
                              {u.nama} ({u.singkatan})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} placeholder="pcs, Kg, Liter..." required />
                    )}
                  </Field>
                  <Field label="Minimum Stok">
                    <Input type="number" min={0} step="0.001" value={form.minimum_stok} onChange={(e) => setForm({ ...form, minimum_stok: Number(e.target.value) })} />
                  </Field>
                  <Field label="Harga Beli">
                    <Input type="number" min={0} value={form.harga_beli} onChange={(e) => setForm({ ...form, harga_beli: Number(e.target.value) })} />
                  </Field>
                  <Field label="Harga Jual">
                    <Input type="number" min={0} value={form.harga_jual} onChange={(e) => setForm({ ...form, harga_jual: Number(e.target.value) })} />
                  </Field>
                </FormGrid>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
              </FormStack>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable
        data={tableData}
        columns={columns}
        getRowKey={(p) => p.id}
        searchPlaceholder="Cari kode atau nama barang..."
        searchFilter={(p, q) =>
          p.nama_barang.toLowerCase().includes(q) ||
          p.kode_barang.toLowerCase().includes(q) ||
          (p.categories?.nama ?? "").toLowerCase().includes(q)
        }
        emptyMessage="Belum ada barang"
        filters={
          <>
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStok} onValueChange={setFilterStok}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stok" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Stok</SelectItem>
                <SelectItem value="menipis">Stok Menipis</SelectItem>
                <SelectItem value="aman">Stok Aman</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>QR Code - {selectedProduct?.nama_barang}</DialogTitle></DialogHeader>
          {selectedProduct?.qr_code_url && (
            <div className="flex flex-col items-center gap-4">
              <Image src={selectedProduct.qr_code_url} alt="QR Code" width={256} height={256} />
              <p className="text-sm text-muted-foreground">{selectedProduct.kode_barang}</p>
              <Button asChild>
                <a href={selectedProduct.qr_code_url} download={`qr-${selectedProduct.kode_barang}.png`}>
                  Download QR
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Scan Barcode</DialogTitle></DialogHeader>
          <BarcodeScanner
            onScan={(code) => {
              const found = products.find((p) => p.kode_barang === code);
              if (found) {
                toast.success(`Ditemukan: ${found.nama_barang} (Stok: ${found.stok} ${found.satuan})`);
                setScanOpen(false);
              } else {
                toast.error(`Barang dengan kode ${code} tidak ditemukan`);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
