import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api";
import { ReportClient } from "@/components/laporan/report-client";
import { PageHeader } from "@/components/layout/page-header";

export function LaporanStokPage() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: productApi.list });

  const columns = [
    { key: "kode", label: "Kode" },
    { key: "nama", label: "Nama Barang" },
    { key: "kategori", label: "Kategori" },
    { key: "stok", label: "Stok" },
    { key: "satuan", label: "Satuan" },
    { key: "minimum", label: "Min. Stok" },
    { key: "harga_beli", label: "Harga Beli" },
  ];

  const data = products.map((p) => ({
    kode: p.kode_barang,
    nama: p.nama_barang,
    kategori: p.kategori_nama ?? "-",
    stok: Number(p.stok),
    satuan: p.satuan,
    minimum: Number(p.minimum_stok),
    harga_beli: Number(p.harga_beli),
  }));

  const pdfColumns = ["Kode", "Nama", "Kategori", "Stok", "Satuan", "Min", "Harga Beli"];
  const pdfRows = data.map((r) => [r.kode, r.nama, r.kategori, r.stok, r.satuan, r.minimum, r.harga_beli]);

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Stok" description="Laporan stok barang saat ini" />
      <ReportClient title="Laporan Stok" columns={columns} data={data} pdfColumns={pdfColumns} pdfRows={pdfRows} />
    </div>
  );
}
