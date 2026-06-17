-- Reset semua data bisnis (kecuali user/profiles)
-- Hanya bisa dipanggil oleh owner via RPC

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

  DELETE FROM sales;
  DELETE FROM recipe_items;
  DELETE FROM recipes;
  DELETE FROM stock_out;
  DELETE FROM stock_in;
  DELETE FROM products;
  DELETE FROM suppliers;
  DELETE FROM categories;
  DELETE FROM audit_logs;
  DELETE FROM units;

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
