# AgroSpasial

Platform marketplace komoditas pertanian berbasis **WebGIS** yang menghubungkan petani/kelompok tani (seller) dengan pembeli. Setiap toko tani memiliki **titik lokasi dan poligon lahan** (GeoJSON), sistem **paket toko bertingkat (Silver, Gold, Luxury)** dengan komisi dan kuota berbeda, pembayaran upgrade paket melalui **Midtrans Snap**, serta proses **verifikasi toko oleh admin**.

Dibangun dengan **Next.js** (frontend) dan **Express.js + Prisma + PostgreSQL** (backend API modular).

---

## Fitur Utama

- **Onboarding Mitra Tani 3 Langkah**: profil toko, pemilihan tier, lalu penentuan koordinat lokasi usaha tani. Setelah selesai, toko masuk antrean verifikasi admin.
- **Paket Toko Bertingkat (Tier)**: Silver, Gold, dan Luxury dengan komisi platform, batas produk, dan batas produk highlight yang berbeda (lihat tabel di bawah).
- **Data Spasial Lahan (GeoJSON)**: titik lokasi (`POINT`) dan batas lahan (`POLYGON`) disimpan per toko beserta luas lahan dalam hektare.
- **Katalog & Inventori Komoditas**: kategori, produk, stok, berat, produk unggulan (highlight), dan snapshot harga.
- **Pembayaran Midtrans Snap**: pembayaran upgrade paket toko dan transaksi pesanan, dengan pencatatan payload webhook.
- **Transaksi E-Commerce**: keranjang, pesanan per toko, item pesanan dengan harga terkunci, biaya platform, dan jarak pengiriman.
- **Ulasan & Notifikasi**: ulasan per item pesanan dan notifikasi pengguna.
- **Back-Office Admin**: verifikasi toko, pengaturan aplikasi, dan log aktivitas admin.
- **Autentikasi & Otorisasi Berbasis Peran**: JWT dengan peran `admin`, `seller`, dan `buyer`.

## Paket Toko (Tier)

| Tier | Komisi | Maks. Produk | Maks. Highlight | Keunggulan |
|---|---|---|---|---|
| **Silver** (gratis) | 5% | 4 | 1 | Laporan analitik dasar |
| **Gold** | 3% | 8 | 3 | Poligon lahan luas |
| **Luxury** | 1,5% | 12 | 6 | Banner toko mandiri |

Batas produk dan highlight divalidasi di sisi server saat seller menambah produk.

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Axios, lucide-react |
| Backend | Node.js, Express.js, nodemon |
| ORM & Database | Prisma, PostgreSQL |
| Pembayaran | Midtrans Snap (`midtrans-client`) |
| Autentikasi | JWT (Bearer token) |
| Data Spasial | GeoJSON (tipe `Point` dan `Polygon`) |

## Prasyarat Sistem

- **Node.js** versi 18 atau lebih baru
- **PostgreSQL** 14 atau lebih baru
- **Git**
- Akun **Midtrans Sandbox** (untuk pengujian pembayaran)
- **cloudflared** atau ngrok (untuk menerima webhook Midtrans saat development lokal)

## Struktur Proyek

```
agrospasial-project/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.js
│       ├── config/            # koneksi Prisma
│       ├── middlewares/       # authenticateToken, authorizeRoles
│       ├── routes/            # definisi endpoint per modul
│       ├── controllers/       # penanganan request/response
│       ├── services/          # logika bisnis (seller, payment, dll)
│       └── utils/             # helper respons
└── frontend/                  # aplikasi Next.js
```

## Panduan Instalasi & Menjalankan Proyek

### 1. Kloning Repositori

```bash
git clone <url-repositori>
cd agrospasial-project
```

### 2. Backend

```bash
cd backend
npm install
```

Buat berkas `.env` di folder `backend/` (lihat tabel variabel lingkungan di bawah), lalu siapkan database:

```bash
# Buat Prisma Client
npx prisma generate

# Terapkan skema ke database
npx prisma migrate dev
# atau, untuk prototyping cepat:
npx prisma db push
```

Jalankan server pengembangan:

```bash
npm run dev
```

Server berjalan di `http://localhost:5000`. Cek kesehatan API di URL tersebut, responsnya:

```json
{
  "status": "Online",
  "system": "AgroSpasial Modular Backend API",
  "version": "1.0.0"
}
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:3000`. Frontend memanggil backend pada `http://localhost:5000/api`.

## Variabel Lingkungan (`backend/.env`)

| Variabel | Deskripsi |
|---|---|
| `DATABASE_URL` | URI koneksi PostgreSQL, contoh: `postgresql://user:password@localhost:5432/agrospasial` |
| `JWT_SECRET` | Kunci penandatangan token JWT. Gunakan string acak yang panjang. |
| `MIDTRANS_SERVER_KEY` | Server key dari Midtrans Dashboard (rahasia, jangan di-commit). |
| `MIDTRANS_CLIENT_KEY` | Client key untuk Snap di frontend. |
| `MIDTRANS_IS_PRODUCTION` | `false` untuk Sandbox, `true` untuk transaksi nyata. |
| `PORT` | Port server backend (bawaan `5000`). |

> **Keamanan:** pastikan `.env` masuk `.gitignore`. Jangan menempelkan log yang memuat header `Authorization` Midtrans ke tempat publik, karena server key dapat didekode dari header tersebut.

## Ringkasan Endpoint API

Semua endpoint diawali `/api`. Endpoint di bawah memerlukan header `Authorization: Bearer <token>` dan peran `seller` atau `admin`.

### Seller: Onboarding & Dashboard

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/seller/dashboard` | Data toko seller (hanya jika onboarding selesai) |
| `POST` | `/seller/onboarding/shop` | Langkah 1: simpan profil toko |
| `PATCH` | `/seller/onboarding/tier` | Langkah 2: pilih tier toko |
| `POST` | `/seller/spatial` | Langkah 3: simpan titik/poligon lokasi |
| `POST` | `/seller/onboarding/finish` | Selesaikan onboarding, masuk antrean verifikasi |

### Seller: Produk

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/seller/products` | Tambah produk (dengan validasi batas tier) |

### Pembayaran

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/payments/create-tier-charge` | Buat transaksi Snap untuk upgrade tier |
| `POST` | `/payments/notification` | Webhook notifikasi Midtrans (tanpa JWT) |

Contoh payload menyimpan titik lokasi:

```json
{
  "assetType": "POINT",
  "geom": { "type": "Point", "coordinates": [104.8856, -4.8214] }
}
```

> Urutan koordinat GeoJSON adalah **[longitude, latitude]**.

## Alur Onboarding Seller

`onboarding_step` pada tabel `Shop` menyimpan progres:

| Step | Arti |
|---|---|
| 1 | Belum mengisi profil toko |
| 2 | Profil tersimpan, memilih tier |
| 3 | Tier dipilih, menentukan lokasi spasial |
| 4 | Selesai, menunggu verifikasi admin |

## Skema Database

Skema lengkap ada di [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma). Terbagi dalam lima modul:

| Modul | Model |
|---|---|
| **1. IAM** | `User`, `UserProfile`, `UserAddress` |
| **2. Mitra & Spasial** | `Shop`, `SpatialAsset` |
| **3. Katalog & Inventori** | `Category`, `Product`, `ProductSnapshot` |
| **4. Transaksi** | `CartSession`, `CartItem`, `Order`, `OrderItem`, `Payment` |
| **5. Interaksi & Back-Office** | `Review`, `Notification`, `TierPurchase`, `AppSetting`, `AdminActivityLog` |

```mermaid
erDiagram
    User ||--o| UserProfile : memiliki
    User ||--o{ UserAddress : memiliki
    User ||--o| Shop : memiliki
    User ||--o{ Order : membuat
    User ||--o{ Review : menulis
    Shop ||--o{ SpatialAsset : memiliki
    Shop ||--o{ Product : menjual
    Shop ||--o{ Order : menerima
    Shop ||--o{ TierPurchase : membeli
    Category ||--o{ Product : mengelompokkan
    Product ||--o{ ProductSnapshot : riwayat
    Product ||--o{ OrderItem : dipesan
    Order ||--o{ OrderItem : berisi
    Order ||--o| Payment : dibayar
    OrderItem ||--o| Review : diulas
```

Catatan desain:

- `SpatialAsset.geom` bertipe `Json` dan menyimpan GeoJSON. Query spasial (jarak, irisan) dilakukan di aplikasi, bukan di database.
- `Shop.owner_id` bersifat unik, sehingga satu pengguna memiliki satu toko.
- `OrderItem.locked_price` mengunci harga saat pesanan dibuat, terlepas dari perubahan harga produk berikutnya.
- Status pesanan: `pending`, `paid`, `shipped`, `completed`, `canceled`.

## Integrasi Midtrans di Lingkungan Lokal

Midtrans harus memanggil backend Anda dari internet, sedangkan `localhost` tidak dapat dijangkau. Gunakan tunnel:

### 1. Jalankan Cloudflare Tunnel

```powershell
winget install --id Cloudflare.cloudflared
cloudflared tunnel --url http://localhost:5000
```

Salin URL yang muncul, misalnya `https://xxxx.trycloudflare.com`. Terminal harus tetap terbuka, dan URL berubah setiap tunnel dijalankan ulang.

### 2. Atur Payment Notification URL

Di **Midtrans Dashboard (Sandbox)** buka **Settings → Configuration**, lalu isi:

```
https://xxxx.trycloudflare.com/api/payments/notification
```

### 3. Uji Pembayaran

Lakukan pembayaran dari frontend, selesaikan lewat **Midtrans Payment Simulator**, lalu pantau terminal backend untuk melihat notifikasi yang masuk.

### Aturan Penting Midtrans

- `order_id` maksimal **50 karakter**. Contoh format aman: `TIER-LUX-<12 karakter shopId>-<timestamp>`.
- Handler webhook **wajib memverifikasi `signature_key`**:
  `SHA512(order_id + status_code + gross_amount + SERVER_KEY)`.
- Endpoint webhook **tidak boleh** memakai `authenticateToken`.
- Handler harus **idempoten** (notifikasi yang sama bisa dikirim berkali-kali) dan membalas HTTP 200 dengan cepat.
- Upgrade tier hanya diterapkan saat status `settlement`, atau `capture` dengan `fraud_status` `accept`.

## Beralih ke Midtrans Produksi

1. Pastikan verifikasi/KYC merchant telah disetujui Midtrans.
2. Di Dashboard Midtrans, alihkan environment dari **SANDBOX** ke **PRODUCTION**.
3. Salin **Server Key** dan **Client Key** produksi dari **Settings → Access Keys**.
4. Perbarui `.env` server produksi:
   ```env
   MIDTRANS_IS_PRODUCTION=true
   MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxx
   MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxx
   ```
5. Isi Payment Notification URL dengan domain resmi, misalnya `https://domain-anda.com/api/payments/notification`, dan pastikan dapat diakses publik dengan respons HTTP 200.

## Pemecahan Masalah (Troubleshooting)

| Gejala | Penyebab & Solusi |
|---|---|
| `EPERM: operation not permitted, unlink ...query_engine-windows.dll.node` saat `prisma generate` | File engine dipakai proses Node yang masih berjalan. Hentikan backend (`Ctrl+C`), jalankan ulang `npx prisma generate`. Jika masih gagal: `taskkill /F /IM node.exe`, atau hapus `node_modules\.prisma` lalu generate ulang. |
| `Cannot GET /api/seller/onboarding/shop` di browser | Route tersebut hanya melayani `POST`. Buka lewat browser (GET) memang menghasilkan pesan ini. Uji dengan Postman atau `curl -X POST`. |
| `404` pada `/api/seller/...` | Pastikan router di-mount (`app.use('/api/seller', sellerRoutes)`) sebelum handler 404, dan tidak ada proses lain yang memakai port 5000 (`netstat -ano | findstr :5000`). |
| `403` pada `/seller/dashboard` | Onboarding belum selesai (`onboarding_step < 4`). Selesaikan seluruh langkah onboarding. |
| Midtrans `transaction_details.order_id is too long` | `order_id` melebihi 50 karakter. Persingkat format `order_id`. |
| Midtrans `401 Unauthorized` | Server key salah, atau key Sandbox dipakai pada mode Production (atau sebaliknya). |

## Hak Akses Peran

| Peran | Kemampuan |
|---|---|
| `buyer` | Menelusuri katalog, keranjang, membuat pesanan, memberi ulasan |
| `seller` | Onboarding toko, mengelola produk dan aset spasial, upgrade tier |
| `admin` | Verifikasi toko, pengaturan aplikasi, akses penuh endpoint seller, log aktivitas |

## Lisensi

Tentukan lisensi proyek di sini (misalnya MIT) atau hapus bagian ini jika belum ditentukan.
