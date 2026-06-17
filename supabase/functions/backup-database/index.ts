// Supabase Edge Function: Database Backup
// Deploy: supabase functions deploy backup-database
// Schedule via Supabase Dashboard > Database > Extensions > pg_cron
// Or use external cron to POST to this function

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TABLES = [
  "profiles",
  "categories",
  "suppliers",
  "products",
  "stock_in",
  "stock_out",
  "recipes",
  "recipe_items",
  "sales",
  "audit_logs",
];

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const backup: Record<string, unknown[]> = {};
  const timestamp = new Date().toISOString().split("T")[0];

  for (const table of TABLES) {
    const { data } = await supabase.from(table).select("*");
    backup[table] = data ?? [];
  }

  const jsonContent = JSON.stringify(backup, null, 2);
  const filePath = `backup-${timestamp}.json`;

  const { error } = await supabase.storage
    .from("backups")
    .upload(filePath, jsonContent, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ success: true, file: filePath, tables: TABLES.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});
