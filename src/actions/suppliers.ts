"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SupplierFormData {
  nama: string;
  telepon?: string;
  email?: string;
  alamat?: string;
  pic?: string;
}

export async function createSupplier(data: SupplierFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/master/supplier");
  return { success: true };
}

export async function updateSupplier(id: string, data: SupplierFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/master/supplier");
  return { success: true };
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/master/supplier");
  return { success: true };
}
