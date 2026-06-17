-- Seed data untuk CoffeeStock
-- Jalankan setelah 001_initial_schema.sql

-- Sample suppliers
INSERT INTO suppliers (nama, telepon, email, alamat, pic) VALUES
  ('Kopi Nusantara', '081234567890', 'info@kopinusantara.com', 'Jl. Kopi No. 1, Bandung', 'Budi'),
  ('Fresh Dairy Co', '081987654321', 'sales@freshdairy.com', 'Jl. Susu No. 5, Jakarta', 'Ani'),
  ('Packaging Jaya', '0215551234', 'order@packagingjaya.com', 'Jl. Industri No. 10, Tangerang', 'Rudi')
ON CONFLICT DO NOTHING;

-- Sample products (gunakan subquery untuk supplier/kategori)
INSERT INTO products (kode_barang, nama_barang, kategori_id, supplier_id, satuan, harga_beli, harga_jual, stok, minimum_stok)
SELECT 'BRG-001', 'Arabica', c.id, s.id, 'Kg', 150000, 200000, 10, 5
FROM categories c, suppliers s WHERE c.nama = 'Biji Kopi' AND s.nama = 'Kopi Nusantara'
ON CONFLICT (kode_barang) DO NOTHING;

INSERT INTO products (kode_barang, nama_barang, kategori_id, supplier_id, satuan, harga_beli, harga_jual, stok, minimum_stok)
SELECT 'BRG-002', 'Robusta', c.id, s.id, 'Kg', 120000, 160000, 8, 5
FROM categories c, suppliers s WHERE c.nama = 'Biji Kopi' AND s.nama = 'Kopi Nusantara'
ON CONFLICT (kode_barang) DO NOTHING;

INSERT INTO products (kode_barang, nama_barang, kategori_id, supplier_id, satuan, harga_beli, harga_jual, stok, minimum_stok)
SELECT 'BRG-003', 'Fresh Milk', c.id, s.id, 'Liter', 18000, 25000, 50, 20
FROM categories c, suppliers s WHERE c.nama = 'Susu' AND s.nama = 'Fresh Dairy Co'
ON CONFLICT (kode_barang) DO NOTHING;

INSERT INTO products (kode_barang, nama_barang, kategori_id, supplier_id, satuan, harga_beli, harga_jual, stok, minimum_stok)
SELECT 'BRG-004', 'Gula Aren', c.id, s.id, 'Liter', 35000, 50000, 15, 5
FROM categories c, suppliers s WHERE c.nama = 'Sirup' AND s.nama = 'Kopi Nusantara'
ON CONFLICT (kode_barang) DO NOTHING;

INSERT INTO products (kode_barang, nama_barang, kategori_id, supplier_id, satuan, harga_beli, harga_jual, stok, minimum_stok)
SELECT 'BRG-005', 'Cup 16oz', c.id, s.id, 'pcs', 500, 1000, 500, 100
FROM categories c, suppliers s WHERE c.nama = 'Packaging' AND s.nama = 'Packaging Jaya'
ON CONFLICT (kode_barang) DO NOTHING;

-- Sample recipe: Es Kopi Susu
INSERT INTO recipes (nama_menu, harga_jual) VALUES ('Es Kopi Susu', 18000)
ON CONFLICT (nama_menu) DO NOTHING;

INSERT INTO recipe_items (recipe_id, product_id, qty)
SELECT r.id, p.id, 0.018
FROM recipes r, products p WHERE r.nama_menu = 'Es Kopi Susu' AND p.kode_barang = 'BRG-001'
ON CONFLICT (recipe_id, product_id) DO NOTHING;

INSERT INTO recipe_items (recipe_id, product_id, qty)
SELECT r.id, p.id, 0.15
FROM recipes r, products p WHERE r.nama_menu = 'Es Kopi Susu' AND p.kode_barang = 'BRG-003'
ON CONFLICT (recipe_id, product_id) DO NOTHING;

INSERT INTO recipe_items (recipe_id, product_id, qty)
SELECT r.id, p.id, 0.02
FROM recipes r, products p WHERE r.nama_menu = 'Es Kopi Susu' AND p.kode_barang = 'BRG-004'
ON CONFLICT (recipe_id, product_id) DO NOTHING;

-- Create backups storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;
