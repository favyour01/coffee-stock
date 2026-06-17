"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(nama: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ nama });
  if (error) return { error: error.message };
  revalidatePath("/master/kategori");
  return { success: true };
}

export async function updateCategory(id: string, nama: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ nama }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/master/kategori");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/master/kategori");
  return { success: true };
}
