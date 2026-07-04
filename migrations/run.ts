/**
 * Migration runner: bun run migrate
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

function stripComments(sql: string): string {
  return sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .trim();
}

async function run() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: false,
  });

  console.log("Membuat database jika belum ada...");
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${DB_NAME}\``);

  console.log("Menjalankan migrations/001_schema.sql...");

  const sqlFile = readFileSync(resolve(import.meta.dir, "001_schema.sql"), "utf-8");

  const statements = sqlFile
    .split(";")
    .map((raw) => stripComments(raw))
    .filter((s) => s.length > 0);

  let ok = 0;
  let warn = 0;

  for (const stmt of statements) {
    try {
      await conn.query(stmt);
      ok++;
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const msg = e.message ?? "";
      if (
        e.code === "ER_TABLE_EXISTS_ERROR" ||
        e.code === "ER_DUP_ENTRY" ||
        e.code === "ER_DUP_KEYNAME" ||
        msg.includes("Duplicate key name") ||
        msg.includes("already exists")
      ) {
        // Skip — sudah ada
      } else {
        warn++;
        console.warn(`  Warning [${e.code ?? "?"}]: ${msg.slice(0, 150)}`);
      }
    }
  }

  await conn.end();
  console.log(`✓ Migration selesai! (${ok} OK, ${warn} warning)`);
}

run().catch((err) => {
  console.error("Migration gagal:", err.message);
  process.exit(1);
});
