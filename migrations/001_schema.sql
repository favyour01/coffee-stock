-- CoffeeStock MySQL Schema
-- Run: bun run migrate

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     NOT NULL,
  nama          VARCHAR(255) NOT NULL DEFAULT '',
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('owner','admin','stok','kasir') NOT NULL DEFAULT 'kasir',
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id         CHAR(36)     NOT NULL,
  nama       VARCHAR(255) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS units (
  id         CHAR(36)     NOT NULL,
  nama       VARCHAR(100) NOT NULL,
  singkatan  VARCHAR(20)  NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_units_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS suppliers (
  id         CHAR(36)     NOT NULL,
  nama       VARCHAR(255) NOT NULL,
  telepon    VARCHAR(50),
  email      VARCHAR(255),
  alamat     TEXT,
  pic        VARCHAR(255),
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id            CHAR(36)      NOT NULL,
  kode_barang   VARCHAR(100)  NOT NULL,
  nama_barang   VARCHAR(255)  NOT NULL,
  kategori_id   CHAR(36),
  supplier_id   CHAR(36),
  satuan        VARCHAR(50)   NOT NULL DEFAULT 'pcs',
  harga_beli    DECIMAL(15,2) NOT NULL DEFAULT 0,
  harga_jual    DECIMAL(15,2) NOT NULL DEFAULT 0,
  stok          DECIMAL(15,3) NOT NULL DEFAULT 0,
  minimum_stok  DECIMAL(15,3) NOT NULL DEFAULT 0,
  qr_code_url   TEXT,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_kode (kode_barang),
  CONSTRAINT fk_products_kategori FOREIGN KEY (kategori_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stock_in (
  id          CHAR(36)      NOT NULL,
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
  CONSTRAINT fk_stock_in_user     FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stock_out (
  id          CHAR(36)      NOT NULL,
  product_id  CHAR(36)      NOT NULL,
  qty         DECIMAL(15,3) NOT NULL,
  tanggal     DATE          NOT NULL,
  keterangan  TEXT,
  user_id     CHAR(36)      NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_stock_out_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT fk_stock_out_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recipes (
  id         CHAR(36)      NOT NULL,
  nama_menu  VARCHAR(255)  NOT NULL,
  harga_jual DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_recipes_nama (nama_menu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recipe_items (
  id         CHAR(36)      NOT NULL,
  recipe_id  CHAR(36)      NOT NULL,
  product_id CHAR(36)      NOT NULL,
  qty        DECIMAL(15,3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_recipe_items (recipe_id, product_id),
  CONSTRAINT fk_ri_recipe  FOREIGN KEY (recipe_id)  REFERENCES recipes(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ri_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sales (
  id         CHAR(36) NOT NULL,
  recipe_id  CHAR(36) NOT NULL,
  qty        INT      NOT NULL,
  tanggal    DATE     NOT NULL,
  user_id    CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_sales_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE RESTRICT,
  CONSTRAINT fk_sales_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id         CHAR(36)     NOT NULL,
  user_id    CHAR(36),
  action     VARCHAR(20)  NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id  CHAR(36),
  old_data   JSON,
  new_data   JSON,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX IF NOT EXISTS idx_products_kategori ON products(kategori_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier  ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_in_tanggal   ON stock_in(tanggal);
CREATE INDEX IF NOT EXISTS idx_stock_in_product   ON stock_in(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_out_tanggal  ON stock_out(tanggal);
CREATE INDEX IF NOT EXISTS idx_stock_out_product  ON stock_out(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_tanggal      ON sales(tanggal);
CREATE INDEX IF NOT EXISTS idx_audit_created      ON audit_logs(created_at);

INSERT IGNORE INTO categories (id, nama) VALUES
  (UUID(), 'Biji Kopi'),
  (UUID(), 'Susu'),
  (UUID(), 'Sirup'),
  (UUID(), 'Packaging'),
  (UUID(), 'Peralatan');

SET FOREIGN_KEY_CHECKS = 1;
