/**
 * Migration runner: bun run migrate
 * Membaca 001_schema.sql dan menjalankan ke MySQL
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve } from "path";

const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "coffeestock",
} = process.env;

async function run() {
  // Connect tanpa database dulu untuk CREATE DATABASE IF NOT EXISTS
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  console.log("Membuat database jika belum ada...");
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${DB_NAME}\``);

  console.log("Menjalankan migrations/001_schema.sql...");
  const sql = readFileSync(resolve(import.meta.dir, "001_schema.sql"), "utf-8");

  // Pisah berdasarkan DELIMITER // ... DELIMITER ; karena mysql2 tidak support DELIMITER
  // Kita jalankan non-trigger statements dulu, lalu trigger secara manual
  const parts = sql.split(/DELIMITER\s*\/\//i);
  const beforeTriggers = parts[0];

  // Jalankan statements sebelum triggers
  const statements = beforeTriggers
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    try {
      await conn.query(stmt);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "ER_TABLE_EXISTS_ERROR" || e.code === "ER_DUP_ENTRY") {
        // Skip jika sudah ada
      } else if (e.code === "ER_DUP_KEYNAME" || e.message?.includes("Duplicate key name")) {
        // Skip duplikat index
      } else {
        console.warn("Warning:", e.message?.slice(0, 100));
      }
    }
  }

  // Buat triggers secara manual
  const triggers = [
    `CREATE TRIGGER IF NOT EXISTS trg_stock_in_add
      AFTER INSERT ON stock_in FOR EACH ROW
      UPDATE products SET stok = stok + NEW.qty WHERE id = NEW.product_id`,

    `CREATE TRIGGER IF NOT EXISTS trg_stock_out_reduce
      BEFORE INSERT ON stock_out FOR EACH ROW
      BEGIN
        DECLARE cur_stok DECIMAL(15,3);
        SELECT stok INTO cur_stok FROM products WHERE id = NEW.product_id FOR UPDATE;
        IF cur_stok < NEW.qty THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stok tidak mencukupi';
        END IF;
        UPDATE products SET stok = stok - NEW.qty WHERE id = NEW.product_id;
      END`,

    `CREATE TRIGGER IF NOT EXISTS trg_sale_reduce_stock
      AFTER INSERT ON sales FOR EACH ROW
      BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_product_id CHAR(36);
        DECLARE v_qty DECIMAL(15,3);
        DECLARE v_cur_stok DECIMAL(15,3);
        DECLARE cur CURSOR FOR
          SELECT product_id, qty FROM recipe_items WHERE recipe_id = NEW.recipe_id;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
        OPEN cur;
        read_loop: LOOP
          FETCH cur INTO v_product_id, v_qty;
          IF done THEN LEAVE read_loop; END IF;
          SELECT stok INTO v_cur_stok FROM products WHERE id = v_product_id FOR UPDATE;
          IF v_cur_stok < (v_qty * NEW.qty) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stok bahan tidak mencukupi untuk penjualan ini';
          END IF;
          UPDATE products SET stok = stok - (v_qty * NEW.qty) WHERE id = v_product_id;
        END LOOP;
        CLOSE cur;
      END`,
  ];

  for (const trigger of triggers) {
    try {
      await conn.query(trigger);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.warn("Trigger warning:", e.message?.slice(0, 100));
    }
  }

  await conn.end();
  console.log("✓ Migration selesai!");
}

run().catch((err) => {
  console.error("Migration gagal:", err.message);
  process.exit(1);
});
