-- Units (satuan) master data + first user auto-owner

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL UNIQUE,
  singkatan TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO units (nama, singkatan) VALUES
  ('Pieces', 'pcs'),
  ('Kilogram', 'Kg'),
  ('Gram', 'gram'),
  ('Liter', 'Liter'),
  ('Mililiter', 'ml'),
  ('Box', 'box'),
  ('Pack', 'pack')
ON CONFLICT (nama) DO NOTHING;

ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view units" ON units
  FOR SELECT TO authenticated USING (is_user_active());

CREATE POLICY "Owner admin can manage units" ON units
  FOR ALL TO authenticated
  USING (get_user_role() IN ('owner', 'admin'))
  WITH CHECK (get_user_role() IN ('owner', 'admin'));

CREATE TRIGGER audit_units
  AFTER INSERT OR UPDATE OR DELETE ON units
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- First registered user becomes owner
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  assigned_role user_role;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;

  IF user_count = 0 THEN
    assigned_role := 'owner';
  ELSE
    assigned_role := 'kasir';
  END IF;

  INSERT INTO public.profiles (id, nama, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    COALESCE(NEW.email, ''),
    assigned_role
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;
