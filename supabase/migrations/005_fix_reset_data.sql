-- Fix: Supabase memblokir DELETE tanpa WHERE clause
-- Jalankan di SQL Editor jika reset data error "DELETE REQUIRES a WHERE CLAUSE"

CREATE OR REPLACE FUNCTION public.reset_all_business_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF get_user_role() IS DISTINCT FROM 'owner'::user_role THEN
    RAISE EXCEPTION 'Hanya owner yang dapat menghapus semua data';
  END IF;

  -- Urutan: child dulu, parent belakangan (FK)
  DELETE FROM sales WHERE true;
  DELETE FROM recipe_items WHERE true;
  DELETE FROM recipes WHERE true;
  DELETE FROM stock_out WHERE true;
  DELETE FROM stock_in WHERE true;
  DELETE FROM products WHERE true;
  DELETE FROM suppliers WHERE true;
  DELETE FROM categories WHERE true;
  DELETE FROM audit_logs WHERE true;
  DELETE FROM units WHERE true;

  INSERT INTO units (nama, singkatan) VALUES
    ('Pieces', 'pcs'),
    ('Kilogram', 'Kg'),
    ('Gram', 'gram'),
    ('Liter', 'Liter'),
    ('Mililiter', 'ml'),
    ('Box', 'box'),
    ('Pack', 'pack')
  ON CONFLICT (nama) DO NOTHING;

  INSERT INTO categories (nama) VALUES
    ('Biji Kopi'),
    ('Susu'),
    ('Sirup'),
    ('Packaging'),
    ('Peralatan')
  ON CONFLICT (nama) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_all_business_data() TO authenticated;
