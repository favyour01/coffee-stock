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
| Process Manager | systemd (bukan PM2 — PM2 butuh Node.js) |

---

## Instalasi di VPS Fresh (Ubuntu 22.04)

### 1. Update sistem & install dependensi dasar

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx
```

### 2. Tambah swap (WAJIB untuk VPS RAM kecil)

Build frontend butuh cukup banyak RAM. Tanpa swap, build bisa gagal dengan error `Killed` / `SIGKILL`.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verifikasi
free -h
```

> Untuk VPS 1GB RAM, gunakan swap 4GB (`fallocate -l 4G`).

### 3. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Verifikasi & catat path bun
bun --version
which bun    # contoh: /root/.bun/bin/bun
```

### 4. Install MySQL 8

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

### 5. Buat database & user MySQL

```bash
sudo mysql -u root -p
```

Di dalam MySQL shell (ganti password dengan yang kuat):

```sql
CREATE DATABASE coffeestock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'coffeestock'@'localhost' IDENTIFIED BY 'ganti_password_kuat_disini';
GRANT ALL PRIVILEGES ON coffeestock.* TO 'coffeestock'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 6. Clone repository

```bash
cd /var/www
sudo git clone https://github.com/username/coffeestock.git stok
sudo chown -R $USER:$USER /var/www/stok
cd /var/www/stok
```

### 7. Install dependencies

```bash
bun install
```

### 8. Konfigurasi environment

```bash
cp .env.example .env
nano .env
```

Isi `.env`:

```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=coffeestock
DB_PASSWORD=ganti_password_kuat_disini
DB_NAME=coffeestock

# Generate dengan: openssl rand -base64 48
JWT_SECRET=isi_dengan_string_rahasia_acak_sangat_panjang

APP_URL=https://domain-anda.com
```

Generate JWT_SECRET:
```bash
openssl rand -base64 48
```

### 9. Jalankan migrasi database

```bash
bun run migrate
```

Output yang diharapkan:
```
Membuat database jika belum ada...
Menjalankan migrations/001_schema.sql...
✓ Migration selesai! (23 OK, 0 warning)
```

### 10. Buat user Owner pertama

```bash
# Default: owner@coffeestock.com / owner123
bun run seed

# Atau kustom:
OWNER_NAMA="Nama Owner" OWNER_EMAIL="email@anda.com" OWNER_PASSWORD="password_aman" bun run seed
```

> Segera ganti password setelah login pertama via menu Pengaturan → Profil.

### 11. Build frontend

```bash
bun run build
```

File hasil build masuk ke folder `public/`.

### 12. Jalankan aplikasi dengan systemd

> PM2 TIDAK dipakai karena membutuhkan Node.js. systemd native di Ubuntu dan lebih stabil untuk aplikasi Bun.

Buat service file:

```bash
sudo nano /etc/systemd/system/coffeestock.service
```

Isi berikut (ganti `/root/.bun/bin/bun` sesuai output `which bun`):

```ini
[Unit]
Description=CoffeeStock App
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/stok
ExecStart=/root/.bun/bin/bun run src/server/index.ts
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/var/www/stok/.env

[Install]
WantedBy=multi-user.target
```

Aktifkan & jalankan (auto-start saat boot):

```bash
sudo systemctl daemon-reload
sudo systemctl enable coffeestock
sudo systemctl start coffeestock
```

Cek status & log:

```bash
sudo systemctl status coffeestock
sudo journalctl -u coffeestock -f
```

Test aplikasi jalan:
```bash
curl http://localhost:3001/api/health
# Harusnya: {"status":"ok","timestamp":"..."}
```

### 13. Konfigurasi Nginx (reverse proxy)

```bash
sudo nano /etc/nginx/sites-available/coffeestock
```

Isi (ganti `domain-anda.com` dengan domain atau IP VPS):

```nginx
server {
    listen 80;
    server_name domain-anda.com;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

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
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/coffeestock /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Akses di browser: `http://domain-anda.com` (atau `http://IP_VPS`)

Login dengan:
- Email: `owner@coffeestock.com`
- Password: `owner123`

### 14. (Opsional) HTTPS dengan Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com
sudo systemctl reload nginx
```

---

## Development (Lokal)

### Prasyarat
- [Bun](https://bun.sh) — `curl -fsSL https://bun.sh/install | bash`
- MySQL 8.x running lokal

### Setup

```bash
git clone ...
cd coffeestock
bun install

cp .env.example .env
# Edit .env sesuai MySQL lokal

bun run migrate
bun run seed

# Jalankan API + Vite paralel
bun run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api

---

## Perintah Berguna

```bash
# Development
bun run dev

# Build frontend
bun run build

# Jalankan production (manual, tanpa systemd)
bun run start

# Migrasi database
bun run migrate

# Buat user owner
bun run seed

# ── systemd (production) ──
sudo systemctl start coffeestock      # Start
sudo systemctl stop coffeestock       # Stop
sudo systemctl restart coffeestock    # Restart
sudo systemctl status coffeestock     # Cek status
sudo journalctl -u coffeestock -f     # Lihat log realtime

# ── Update aplikasi ──
cd /var/www/stok
git pull
bun install
bun run build
sudo systemctl restart coffeestock
```

---

## Struktur Project

```
coffeestock/
├── src/
│   ├── server/               # Backend Elysia.js
│   │   ├── db/               # Database connection & queries
│   │   ├── middleware/       # Auth middleware (JWT)
│   │   ├── routes/           # API routes
│   │   └── index.ts          # Entry point
│   └── client/               # Frontend React + Vite
│       ├── components/       # UI components (Shadcn)
│       ├── pages/            # Halaman per fitur
│       ├── lib/              # Utilities, API client, auth
│       ├── hooks/            # Custom hooks
│       ├── types/            # TypeScript types
│       └── main.tsx          # Router entry
├── migrations/               # MySQL migrations + seed
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
sudo systemctl status mysql
mysql -u coffeestock -p coffeestock -e "SELECT 1"
```

**Build gagal (Killed / SIGKILL) — RAM habis:**
```bash
# Pastikan swap aktif
free -h

# Kalau belum ada swap:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Service tidak jalan / cek error:**
```bash
sudo systemctl status coffeestock
sudo journalctl -u coffeestock -n 50 --no-pager
```

**Service tidak auto-start setelah reboot:**
```bash
sudo systemctl enable coffeestock
```

**Port 3001 sudah dipakai:**
```bash
sudo lsof -i :3001
# Ubah PORT di .env lalu:
sudo systemctl restart coffeestock
```

**Login gagal "Email atau password salah":**
```bash
# Buat ulang user owner
bun run seed
```
