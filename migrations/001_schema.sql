-- CoffeeStock MySQL Schema
-- Run: bun run migrate

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Users (mengganti profiles + Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  nama         VARCHAR(255) NOT NULL DEFAULT '',
  email        VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('owner','admin','stok','kasir') NOT NULL DEFAULT 'kasir',
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  nama       VARCHAR(255) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Units (Satuan)
CREATE TABLE IF NOT EXISTS units (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  nama       VARCHAR(100) NOT NULL,
  singkatan  VARCHAR(20)  NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_units_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  nama       VARCHAR(255) NOT NULL,
  telepon    VARCHAR(50),
  email      VARCHAR(255),
  alamat     TEXT,
  pic        VARCHAR(255),
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id            CHAR(36)       NOT NULL DEFAULT (UUID()),
  kode_barang   VARCHAR(100)   NOT NULL,
  nama_barang   VARCHAR(255)   NOT NULL,
  kategori_id   CHAR(36),
  supplier_id   CHAR(36),
  satuan        VARCHAR(50)    NOT NULL DEFAULT 'pcs',
  harga_beli    DECIMAL(15,2)  NOT NULL DEFAULT 0,
  harga_jual    DECIMAL(15,2)  NOT NULL DEFAULT 0,
  stok          DECIMAL(15,3)  NOT NULL DEFAULT 0,
  minimum_stok  DECIMAL(15,3)  NOT NULL DEFAULT 0,
  qr_code_url   TEXT,
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_kode (kode_barang),
  CONSTRAINT fk_products_kategori FOREIGN KEY (kategori_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  CONSTRAINT chk_products_stok CHECK (stok >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stock In
CREATE TABLE IF NOT EXISTS stock_in (
  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
  product_id  CHAR(36)      NOT NULL,
  supplier_id CHAR(36)      NOT NULL,
  qty         DECIMAL(15,3) NOT NULL,
  harga_beli  DECIMAL(15,2) NOT NULL DEFAULT 0,
  tanggal     DATE          NOT NULL,
  user_id     CHAR(36)      NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_stock_in_product  FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE RESTRICT,
  CONSTRAINT fk_stock_in_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_stock_in_user     FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE RESTRICT,
  CONSTRAINT chk_stock_in_qty CHECK (qty > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stock Out
CREATE TABLE IF NOT EXISTS stock_out (
  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
  product_id  CHAR(36)      NOT NULL,
  qty         DECIMAL(15,3) NOT NULL,
  tanggal     DATE          NOT NULL,
  keterangan  TEXT,
  user_id     CHAR(36)      NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_stock_out_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT fk_stock_out_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE RESTRICT,
  CONSTRAINT chk_stock_out_qty CHECK (qty > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recipes (menu)
CREATE TABLE IF NOT EXISTS recipes (
  id         CHAR(36)      NOT NULL DEFAULT (UUID()),
  nama_menu  VARCHAR(255)  NOT NULL,
  harga_jual DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_recipes_nama (nama_menu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recipe Items (bahan per menu)
CREATE TABLE IF NOT EXISTS recipe_items (
  id         CHAR(36)      NOT NULL DEFAULT (UUID()),
  recipe_id  CHAR(36)      NOT NULL,
  product_id CHAR(36)      NOT NULL,
  qty        DECIMAL(15,3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_recipe_items (recipe_id, product_id),
  CONSTRAINT fk_ri_recipe  FOREIGN KEY (recipe_id)  REFERENCES recipes(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ri_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT chk_ri_qty CHECK (qty > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id         CHAR(36)  NOT NULL DEFAULT (UUID()),
  recipe_id  CHAR(36)  NOT NULL,
  qty        INT       NOT NULL,
  tanggal    DATE      NOT NULL,
  user_id    CHAR(36)  NOT NULL,
  created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_sales_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE RESTRICT,
  CONSTRAINT fk_sales_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE RESTRICT,
  CONSTRAINT chk_sales_qty CHECK (qty > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id         CHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36),
  action     VARCHAR(20)  NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id  CHAR(36),
  old_data   JSON,
  new_data   JSON,
  created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes
CREATE INDEX idx_products_kategori   ON products(kategori_id);
CREATE INDEX idx_products_supplier   ON products(supplier_id);
CREATE INDEX idx_stock_in_tanggal    ON stock_in(tanggal);
CREATE INDEX idx_stock_in_product    ON stock_in(product_id);
CREATE INDEX idx_stock_out_tanggal   ON stock_out(tanggal);
CREATE INDEX idx_stock_out_product   ON stock_out(product_id);
CREATE INDEX idx_sales_tanggal       ON sales(tanggal);
CREATE INDEX idx_audit_created       ON audit_logs(created_at);

-- Triggers: update stok otomatis saat stock_in
DELIMITER //
CREATE TRIGGER trg_stock_in_add
  AFTER INSERT ON stock_in
  FOR EACH ROW
BEGIN
  UPDATE products SET stok = stok + NEW.qty WHERE id = NEW.product_id;
END //

-- Triggers: update stok otomatis saat stock_out
CREATE TRIGGER trg_stock_out_reduce
  BEFORE INSERT ON stock_out
  FOR EACH ROW
BEGIN
  DECLARE cur_stok DECIMAL(15,3);
  SELECT stok INTO cur_stok FROM products WHERE id = NEW.product_id FOR UPDATE;
  IF cur_stok < NEW.qty THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Stok tidak mencukupi';
  END IF;
  UPDATE products SET stok = stok - NEW.qty WHERE id = NEW.product_id;
END //

-- Triggers: kurangi stok bahan saat penjualan
CREATE TRIGGER trg_sale_reduce_stock
  AFTER INSERT ON sales
  FOR EACH ROW
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_product_id CHAR(36);
  DECLARE v_qty        DECIMAL(15,3);
  DECLARE v_cur_stok   DECIMAL(15,3);
  DECLARE cur CURSOR FOR
    SELECT product_id, qty FROM recipe_items WHERE recipe_id = NEW.recipe_id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_product_id, v_qty;
    IF done THEN LEAVE read_loop; END IF;
    SELECT stok INTO v_cur_stok FROM products WHERE id = v_product_id FOR UPDATE;
    IF v_cur_stok < (v_qty * NEW.qty) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stok bahan tidak mencukupi untuk penjualan ini';
    END IF;
    UPDATE products SET stok = stok - (v_qty * NEW.qty) WHERE id = v_product_id;
  END LOOP;
  CLOSE cur;
END //
DELIMITER ;

-- Seed: kategori default
INSERT IGNORE INTO categories (id, nama) VALUES
  (UUID(), 'Biji Kopi'),
  (UUID(), 'Susu'),
  (UUID(), 'Sirup'),
  (UUID(), 'Packaging'),
  (UUID(), 'Peralatan');

SET FOREIGN_KEY_CHECKS = 1;
