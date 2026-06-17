"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import QRCode from "qrcode";

export interface ProductFormData {
  kode_barang: string;
  nama_barang: string;
  kategori_id: string | null;
  supplier_id: string | null;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  minimum_stok: number;
}

export async function createProduct(data: ProductFormData) {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({ ...data, stok: 0 })
    .select()
    .single();

  if (error) return { error: error.message };

  if (product) {
    await generateAndUploadQR(product.id, product.kode_barang);
  }

  revalidatePath("/master/barang");
  return { success: true };
}

export async function updateProduct(id: string, data: ProductFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/master/barang");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/master/barang");
  return { success: true };
}

export async function generateAndUploadQR(productId: string, kodeBarang: string) {
  const supabase = await createClient();
  const qrDataUrl = await QRCode.toDataURL(kodeBarang, { width: 256 });
  const base64 = qrDataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");

  const filePath = `${productId}.png`;
  const { error: uploadError } = await supabase.storage
    .from("qr-codes")
    .upload(filePath, buffer, { contentType: "image/png", upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from("qr-codes").getPublicUrl(filePath);

  await supabase
    .from("products")
    .update({ qr_code_url: urlData.publicUrl })
    .eq("id", productId);

  revalidatePath("/master/barang");
  return { success: true, url: urlData.publicUrl };
}

export async function findProductByCode(kode: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(nama), suppliers(nama)")
    .eq("kode_barang", kode)
    .single();
  return data;
}
