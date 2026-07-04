# CoffeeStock — Sistem Inventaris Kedai Kopi

Sistem inventaris berbasis web untuk kedai kopi. Dibangun dengan **Bun.js + Elysia.js** (backend) dan **React + Vite** (frontend) dengan database **MySQL**.

## Fitur

- Multi-role: Owner, Admin, Stok, Kasir
- Master Data: Barang, Kategori, Satuan, Supplier
- Transaksi: Barang Masuk, Barang Keluar, Produksi/Resep, Penjualan
- Analisis: Penggunaan bahan, Forecast stok, Performa supplier
- Laporan: Export PDF & Excel
- Audit Log, Dark Mode, Barcode Scanner

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Runtime | Bun v1.x |
| Backend | Elysia.js |
| Frontend | React 19 + Vite |
| Database | MySQL 8.x |
| Auth | Email/Password + JWT (httpOnly cookie) |
| UI | Shadcn/UI + Tailwind CSS v4 |

---

## Instalasi di VPS Fresh (Ubuntu 22.04)

### 1. Update sistem

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx
```

### 2. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version  # Pastikan terinstall
```

### 3. Install MySQL 8

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Amankan instalasi MySQL
sudo mysql_secure_installation
```

### 4. Buat database & user MySQL

```bash
sudo mysql -u root -p
```

Di dalam MySQL shell:

```sql
CREATE DATABASE coffeestock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'coffeestock'@'localhost' IDENTIFIED BY 'ganti_password_kuat_disini';
GRANT ALL PRIVILEGES ON coffeestock.* TO 'coffeestock'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Clone repository

```bash
cd /var/www
sudo git clone https://github.com/username/coffeestock.git
sudo chown -R $USER:$USER /var/www/coffeestock
cd /var/www/coffeestock
```

### 6. Install dependencies

```bash
bun install
```

### 7. Konfigurasi environment

```bash
cp .env.example .env
nano .env
```

Isi nilai berikut di `.env`:

```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=coffeestock
DB_PASSWORD=ganti_password_kuat_disini
DB_NAME=coffeestock

# Ganti dengan string acak yang panjang (min 32 karakter)
JWT_SECRET=isi_dengan_string_rahasia_acak_sangat_panjang_disini

APP_URL=https://domain-anda.com
```

> Untuk generate JWT_SECRET:
> ```bash
> openssl rand -base64 48
> ```

### 8. Jalankan migrasi database

```bash
bun run migrate
```

Output yang diharapkan:
```
Membuat database jika belum ada...
Menjalankan migrations/001_schema.sql...
✓ Migration selesai!
```

### 9. Buat user Owner pertama

```bash
# Default: owner@coffeestock.com / owner123
bun run seed

# Atau kustomisasi:
OWNER_NAMA="Nama Owner" OWNER_EMAIL="email@anda.com" OWNER_PASSWORD="password_aman" bun run seed
```

> Segera ganti password setelah login pertama melalui menu Pengaturan → Profil.

### 10. Build frontend

```bash
bun run build
```

File frontend akan di-build ke folder `public/`.

### 11. Install PM2

```bash
bun install -g pm2
```

### 12. Jalankan aplikasi dengan PM2

```bash
pm2 start "bun run start" --name coffeestock
pm2 save
pm2 startup  # Ikuti instruksi yang muncul untuk auto-start
```

Cek status:
```bash
pm2 status
pm2 logs coffeestock
```

### 13. Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/coffeestock
```

Isi konfigurasi:

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Proxy ke Bun server
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        proxy_pass http://localhost:3001;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Aktifkan:
```bash
sudo ln -s /etc/nginx/sites-available/coffeestock /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 14. (Opsional) Setup HTTPS dengan Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
sudo systemctl reload nginx
```

---

## Development (Lokal)

### Prasyarat
- [Bun](https://bun.sh) — install dengan `curl -fsSL https://bun.sh/install | bash`
- MySQL 8.x running lokal

### Setup

```bash
# Clone & install
git clone ...
cd coffeestock
bun install

# Setup environment
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL lokal

# Jalankan migrasi
bun run migrate

# Buat user owner
bun run seed

# Jalankan development (API + Vite secara paralel)
bun run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api

---

## Perintah Berguna

```bash
# Jalankan development
bun run dev

# Build frontend
bun run build

# Jalankan production
bun run start

# Jalankan migrasi database
bun run migrate

# Buat user owner
bun run seed

# Restart PM2
pm2 restart coffeestock

# Lihat log
pm2 logs coffeestock --lines 100

# Update aplikasi
git pull
bun install
bun run build
pm2 restart coffeestock
```

---

## Struktur Project

```
coffeestock/
├── src/
│   ├── server/               # Backend Elysia.js
│   │   ├── db/               # Database connection & queries
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # API routes
│   │   └── index.ts          # Entry point
│   └── client/               # Frontend React + Vite
│       ├── components/       # UI components (Shadcn)
│       ├── pages/            # Halaman per fitur
│       ├── lib/              # Utilities, API client, auth
│       ├── hooks/            # Custom hooks
│       ├── types/            # TypeScript types
│       └── main.tsx          # Router entry
├── migrations/               # MySQL migrations
├── public/                   # Frontend build output
├── static/                   # Static assets
├── index.html                # Vite HTML entry
├── vite.config.ts
├── package.json
├── bunfig.toml
└── .env.example
```

---

## Roles & Akses

| Role | Akses |
|------|-------|
| **Owner** | Semua fitur |
| **Admin** | Master Data, Transaksi, Analisis, Laporan, Profil |
| **Stok** | Barang Masuk, Barang Keluar, Dashboard, Profil |
| **Kasir** | Penjualan, Dashboard, Profil |

---

## Troubleshooting

**App tidak bisa akses database:**
```bash
# Cek MySQL running
sudo systemctl status mysql

# Test koneksi
mysql -u coffeestock -p coffeestock -e "SELECT 1"
```

**PM2 tidak auto-start setelah reboot:**
```bash
pm2 startup
# Jalankan perintah yang ditampilkan
pm2 save
```

**Port 3001 sudah dipakai:**
```bash
# Cek proses di port 3001
sudo lsof -i :3001

# Ubah PORT di .env
PORT=3002
pm2 restart coffeestock
```
