-- CoffeeStock Initial Schema
-- Run this in Supabase SQL Editor

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'kasir');

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'kasir',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  telepon TEXT,
  email TEXT,
  alamat TEXT,
  pic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_barang TEXT NOT NULL UNIQUE,
  nama_barang TEXT NOT NULL,
  kategori_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  satuan TEXT NOT NULL DEFAULT 'pcs',
  harga_beli NUMERIC(15,2) NOT NULL DEFAULT 0,
  harga_jual NUMERIC(15,2) NOT NULL DEFAULT 0,
  stok NUMERIC(15,3) NOT NULL DEFAULT 0 CHECK (stok >= 0),
  minimum_stok NUMERIC(15,3) NOT NULL DEFAULT 0,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock In
CREATE TABLE stock_in (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  qty NUMERIC(15,3) NOT NULL CHECK (qty > 0),
  harga_beli NUMERIC(15,2) NOT NULL DEFAULT 0,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock Out
CREATE TABLE stock_out (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  qty NUMERIC(15,3) NOT NULL CHECK (qty > 0),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  keterangan TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recipes
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_menu TEXT NOT NULL UNIQUE,
  harga_jual NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recipe Items
CREATE TABLE recipe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  qty NUMERIC(15,3) NOT NULL CHECK (qty > 0),
  UNIQUE(recipe_id, product_id)
);

-- Sales
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_kategori ON products(kategori_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_stock_in_tanggal ON stock_in(tanggal);
CREATE INDEX idx_stock_out_tanggal ON stock_out(tanggal);
CREATE INDEX idx_sales_tanggal ON sales(tanggal);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Helper: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is active
CREATE OR REPLACE FUNCTION is_user_active()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_active FROM profiles WHERE id = auth.uid()), false);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nama, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    'kasir'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Stock triggers
CREATE OR REPLACE FUNCTION update_stock_on_stock_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET stok = stok + NEW.qty WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_in
  AFTER INSERT ON stock_in
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_stock_in();

CREATE OR REPLACE FUNCTION update_stock_on_stock_out()
RETURNS TRIGGER AS $$
DECLARE
  current_stok NUMERIC;
BEGIN
  SELECT stok INTO current_stok FROM products WHERE id = NEW.product_id FOR UPDATE;
  IF current_stok < NEW.qty THEN
    RAISE EXCEPTION 'Stok tidak mencukupi. Stok tersedia: %', current_stok;
  END IF;
  UPDATE products SET stok = stok - NEW.qty WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_out
  AFTER INSERT ON stock_out
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_stock_out();

CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  current_stok NUMERIC;
  needed NUMERIC;
BEGIN
  FOR item IN
    SELECT product_id, qty FROM recipe_items WHERE recipe_id = NEW.recipe_id
  LOOP
    needed := item.qty * NEW.qty;
    SELECT stok INTO current_stok FROM products WHERE id = item.product_id FOR UPDATE;
    IF current_stok < needed THEN
      RAISE EXCEPTION 'Stok bahan tidak mencukupi untuk penjualan ini';
    END IF;
    UPDATE products SET stok = stok - needed WHERE id = item.product_id;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sale
  AFTER INSERT ON sales
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_sale();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER audit_categories AFTER INSERT OR UPDATE OR DELETE ON categories FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER audit_suppliers AFTER INSERT OR UPDATE OR DELETE ON suppliers FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER audit_stock_in AFTER INSERT OR UPDATE OR DELETE ON stock_in FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER audit_stock_out AFTER INSERT OR UPDATE OR DELETE ON stock_out FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER audit_recipes AFTER INSERT OR UPDATE OR DELETE ON recipes FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER audit_sales AFTER INSERT OR UPDATE OR DELETE ON sales FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER audit_profiles AFTER UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (is_user_active());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Owner can update all profiles" ON profiles FOR UPDATE TO authenticated USING (get_user_role() = 'owner');

-- Categories policies
CREATE POLICY "All authenticated can view categories" ON categories FOR SELECT TO authenticated USING (is_user_active());
CREATE POLICY "Owner admin can manage categories" ON categories FOR ALL TO authenticated
  USING (get_user_role() IN ('owner', 'admin')) WITH CHECK (get_user_role() IN ('owner', 'admin'));

-- Suppliers policies
CREATE POLICY "All authenticated can view suppliers" ON suppliers FOR SELECT TO authenticated USING (is_user_active());
CREATE POLICY "Owner admin can manage suppliers" ON suppliers FOR ALL TO authenticated
  USING (get_user_role() IN ('owner', 'admin')) WITH CHECK (get_user_role() IN ('owner', 'admin'));

-- Products policies
CREATE POLICY "All authenticated can view products" ON products FOR SELECT TO authenticated USING (is_user_active());
CREATE POLICY "Owner admin can manage products" ON products FOR ALL TO authenticated
  USING (get_user_role() IN ('owner', 'admin')) WITH CHECK (get_user_role() IN ('owner', 'admin'));

-- Stock in policies
CREATE POLICY "All authenticated can view stock_in" ON stock_in FOR SELECT TO authenticated USING (is_user_active());
CREATE POLICY "Owner admin can insert stock_in" ON stock_in FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('owner', 'admin'));

-- Stock out policies
CREATE POLICY "All authenticated can view stock_out" ON stock_out FOR SELECT TO authenticated USING (is_user_active());
CREATE POLICY "All roles can insert stock_out" ON stock_out FOR INSERT TO authenticated
  WITH CHECK (is_user_active());

-- Recipes policies
CREATE POLICY "All authenticated can view recipes" ON recipes FOR SELECT TO authenticated USING (is_user_active());
CREATE POLICY "Owner admin can manage recipes" ON recipes FOR ALL TO authenticated
  USING (get_user_role() IN ('owner', 'admin')) WITH CHECK (get_user_role() IN ('owner', 'admin'));

-- Recipe items policies
CREATE POLICY "All authenticated can view recipe_items" ON recipe_items FOR SELECT TO authenticated USING (is_user_active());
CREATE POLICY "Owner admin can manage recipe_items" ON recipe_items FOR ALL TO authenticated
  USING (get_user_role() IN ('owner', 'admin')) WITH CHECK (get_user_role() IN ('owner', 'admin'));

-- Sales policies
CREATE POLICY "All authenticated can view sales" ON sales FOR SELECT TO authenticated USING (is_user_active());
CREATE POLICY "All roles can insert sales" ON sales FOR INSERT TO authenticated
  WITH CHECK (is_user_active());

-- Audit logs policies
CREATE POLICY "Owner can view audit logs" ON audit_logs FOR SELECT TO authenticated
  USING (get_user_role() = 'owner');

-- Storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated can upload qr codes" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'qr-codes');
CREATE POLICY "Anyone can view qr codes" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'qr-codes');
CREATE POLICY "Owner admin can delete qr codes" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'qr-codes' AND get_user_role() IN ('owner', 'admin'));

-- Seed categories
INSERT INTO categories (nama) VALUES
  ('Biji Kopi'),
  ('Susu'),
  ('Sirup'),
  ('Packaging'),
  ('Peralatan')
ON CONFLICT (nama) DO NOTHING;
