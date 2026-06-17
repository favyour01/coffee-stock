"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createUnit(data: { nama: string; singkatan: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from("units").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/master/satuan");
  revalidatePath("/master/barang");
  return { success: true };
}

export async function updateUnit(id: string, data: { nama: string; singkatan: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from("units").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/master/satuan");
  revalidatePath("/master/barang");
  return { success: true };
}

export async function deleteUnit(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("units").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/master/satuan");
  revalidatePath("/master/barang");
  return { success: true };
}
