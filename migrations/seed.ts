/**
 * Seed: buat user Owner pertama
 * Jalankan: bun run seed
 */
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "coffeestock",
  OWNER_NAMA = "Owner",
  OWNER_EMAIL = "owner@coffeestock.com",
  OWNER_PASSWORD = "owner123",
} = process.env;

async function seed() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  // Cek apakah user owner sudah ada
  const [rows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM users WHERE role = 'owner' LIMIT 1"
  );

  if (rows.length > 0) {
    console.log("User owner sudah ada. Skip seeding.");
    await conn.end();
    return;
  }

  const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);
  const id = randomUUID();

  await conn.query(
    "INSERT INTO users (id, nama, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 'owner', 1)",
    [id, OWNER_NAMA, OWNER_EMAIL, passwordHash]
  );

  await conn.end();

  console.log("✓ User owner berhasil dibuat:");
  console.log(`  Email    : ${OWNER_EMAIL}`);
  console.log(`  Password : ${OWNER_PASSWORD}`);
  console.log("  ⚠ Segera ganti password setelah login pertama!");
}

seed().catch((err) => {
  console.error("Seed gagal:", err.message);
  process.exit(1);
});
