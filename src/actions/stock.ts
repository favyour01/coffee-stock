"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";

export async function createStockIn(data: {
  product_id: string;
  supplier_id: string;
  qty: number;
  harga_beli: number;
  tanggal: string;
}) {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from("stock_in").insert({
    ...data,
    user_id: profile.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/transaksi/masuk");
  revalidatePath("/");
  revalidatePath("/master/barang");
  return { success: true };
}

export async function createStockOut(data: {
  product_id: string;
  qty: number;
  tanggal: string;
  keterangan?: string;
}) {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("stok")
    .eq("id", data.product_id)
    .single();

  if (product && Number(product.stok) < data.qty) {
    return { error: `Stok tidak mencukupi. Tersedia: ${product.stok}` };
  }

  const { error } = await supabase.from("stock_out").insert({
    ...data,
    user_id: profile.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/transaksi/keluar");
  revalidatePath("/");
  revalidatePath("/master/barang");
  return { success: true };
}
