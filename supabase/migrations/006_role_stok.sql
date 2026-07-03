-- Role Stok: user hanya bisa akses Barang Masuk & Barang Keluar
-- Jalankan di Supabase SQL Editor

-- 1. Tambah nilai 'stok' ke enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'stok';

-- 2. Update RLS stock_in: tambah role stok
DROP POLICY IF EXISTS "Owner admin can insert stock_in" ON stock_in;
CREATE POLICY "Owner admin stok can insert stock_in" ON stock_in
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('owner', 'admin', 'stok'));

-- 3. Update RLS stock_out: hanya owner/admin/stok (hapus kasir)
DROP POLICY IF EXISTS "All roles can insert stock_out" ON stock_out;
CREATE POLICY "Owner admin stok can insert stock_out" ON stock_out
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('owner', 'admin', 'stok'));
