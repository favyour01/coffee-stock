"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";

export interface RecipeItemInput {
  product_id: string;
  qty: number;
}

export async function createRecipe(data: {
  nama_menu: string;
  harga_jual: number;
  items: RecipeItemInput[];
}) {
  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({ nama_menu: data.nama_menu, harga_jual: data.harga_jual })
    .select()
    .single();

  if (error) return { error: error.message };

  const items = data.items.map((item) => ({
    recipe_id: recipe.id,
    product_id: item.product_id,
    qty: item.qty,
  }));

  const { error: itemsError } = await supabase.from("recipe_items").insert(items);
  if (itemsError) return { error: itemsError.message };

  revalidatePath("/transaksi/produksi");
  return { success: true };
}

export async function updateRecipe(
  id: string,
  data: { nama_menu: string; harga_jual: number; items: RecipeItemInput[] }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .update({ nama_menu: data.nama_menu, harga_jual: data.harga_jual })
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("recipe_items").delete().eq("recipe_id", id);

  const items = data.items.map((item) => ({
    recipe_id: id,
    product_id: item.product_id,
    qty: item.qty,
  }));

  const { error: itemsError } = await supabase.from("recipe_items").insert(items);
  if (itemsError) return { error: itemsError.message };

  revalidatePath("/transaksi/produksi");
  return { success: true };
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/transaksi/produksi");
  return { success: true };
}

export async function createSale(data: {
  recipe_id: string;
  qty: number;
  tanggal: string;
}) {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from("sales").insert({
    ...data,
    user_id: profile.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/transaksi/penjualan");
  revalidatePath("/");
  revalidatePath("/master/barang");
  return { success: true };
}
