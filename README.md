# CoffeeStock

Sistem inventaris dan pencatatan stok kedai kopi — dibangun dengan **Next.js 15**, **Supabase**, **Tailwind CSS**, dan **Shadcn UI**.

## Fitur

- Dashboard KPI & grafik (Recharts)
- Master data: Barang, Satuan, Kategori, Supplier
- Transaksi: Barang Masuk/Keluar, Resep/Produksi, Penjualan Kasir
- Stok otomatis via database triggers
- Notifikasi stok menipis
- Analisis penggunaan, forecast moving average, supplier teraktif
- Laporan dengan export PDF & Excel
- Role-based access: Owner, Admin, Kasir
- Login Google OAuth
- Dark mode
- QR Code barang & scan barcode
- Audit log aktivitas
- PWA (installable di mobile)
- Backup database via Edge Function

## Setup Lokal

### 1. Clone & install

```bash
npm install
cp .env.local.example .env.local
```

### 2. Setup Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Jalankan SQL di `supabase/migrations/` secara berurutan via SQL Editor:
   - `001_initial_schema.sql`
   - `002_fix_auth_signup.sql`
   - `003_units_and_owner.sql`
   - `004_reset_data.sql`
   - `005_fix_reset_data.sql` (jika reset data error WHERE clause)
3. (Opsional) Jalankan `supabase/seed.sql` untuk data contoh
4. Aktifkan **Google OAuth** di Authentication > Providers
5. Tambahkan redirect URL: `http://localhost:3000/auth/callback`
6. Salin URL dan anon key ke `.env.local`

### 3. Set Owner (jika sudah login sebelum migration 003)

User **pertama** yang daftar otomatis jadi Owner. Jika akun kamu masih Kasir, jalankan:

```sql
UPDATE profiles SET role = 'owner' WHERE email = 'email-anda@gmail.com';
```

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deploy ke Vercel

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Di Supabase Auth settings, tambahkan production URL:
   - `https://your-app.vercel.app/auth/callback`
5. Deploy

## Deploy Edge Function Backup

```bash
# Install Supabase CLI
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy backup-database
```

Buat bucket `backups` di Storage jika belum ada (sudah ada di seed.sql).

## Struktur Role

| Fitur | Owner | Admin | Kasir |
|-------|-------|-------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Master Data | ✅ | ✅ | Lihat stok |
| Barang Masuk | ✅ | ✅ | ❌ |
| Barang Keluar | ✅ | ✅ | ✅ |
| Penjualan | ✅ | ✅ | ✅ |
| Laporan & Analisis | ✅ | ✅ | ❌ |
| Kelola User | ✅ | ❌ | ❌ |
| Audit Log | ✅ | ❌ | ❌ |

## Tech Stack

- **Frontend:** Next.js 15, Tailwind CSS v4, Shadcn UI, Recharts
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Deploy:** Vercel (gratis) + Supabase (gratis)
