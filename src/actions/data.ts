"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function resetAllBusinessData(confirmation: string) {
  await requireRole(["owner"]);

  if (confirmation !== "HAPUS SEMUA") {
    return { error: "Konfirmasi tidak valid. Ketik HAPUS SEMUA untuk melanjutkan." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_all_business_data");

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
