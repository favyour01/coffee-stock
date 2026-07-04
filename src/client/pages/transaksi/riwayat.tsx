import { useQuery } from "@tanstack/react-query";
import { stockApi, saleApi } from "@/lib/api";
import { RiwayatClient } from "@/components/transaksi/riwayat-client";
import { PageHeader } from "@/components/layout/page-header";
import type { TransactionHistory } from "@/types";

export function RiwayatPage() {
  const { data: stockIn = [] } = useQuery({ queryKey: ["stock-in"], queryFn: () => stockApi.inList() });
  const { data: stockOut = [] } = useQuery({ queryKey: ["stock-out"], queryFn: () => stockApi.outList() });
  const { data: sales = [] } = useQuery({ queryKey: ["sales"], queryFn: () => saleApi.list() });

  const history: TransactionHistory[] = [
    ...stockIn.map((s) => ({
      id: s.id, type: "stock_in" as const,
      tanggal: s.tanggal,
      description: `Masuk: ${s.product_nama ?? s.product_id}`,
      qty: s.qty, user_name: s.user_nama ?? "-",
    })),
    ...stockOut.map((s) => ({
      id: s.id, type: "stock_out" as const,
      tanggal: s.tanggal,
      description: `Keluar: ${s.product_nama ?? s.product_id}`,
      qty: s.qty, user_name: s.user_nama ?? "-",
    })),
    ...sales.map((s) => ({
      id: s.id, type: "sale" as const,
      tanggal: s.tanggal,
      description: `Jual: ${s.recipe_nama ?? s.recipe_id}`,
      qty: s.qty, user_name: s.user_nama ?? "-",
    })),
  ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat Transaksi" description="Semua riwayat transaksi" />
      <RiwayatClient history={history} />
    </div>
  );
}
