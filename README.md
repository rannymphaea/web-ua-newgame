<div align="center">
  <img src="apps/web/public/logo.png" alt="NEWGAME" width="72" />

  <h1>NEWGAME V2</h1>
  <p>Platform Web UKM Game Development — Universitas Andalas</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis" alt="Redis" />
    <a href="https://unandnewgame-tan.vercel.app"><img src="https://img.shields.io/badge/Live-unandnewgame--tan.vercel.app-black?logo=vercel" alt="Live" /></a>
  </p>
</div>

---

## Ringkasan Platform

NEWGAME V2 adalah platform web terpadu untuk UKM Game Development Universitas Andalas. Platform ini mengelola keanggotaan, sistem presensi berbasis QR, papan peringkat XP gamifikasi, manajemen berita dan media, serta dasbor analitik untuk pengurus.

Arsitektur V2 dibangun di atas monorepo dengan dua aplikasi utama: **backend NestJS** yang terhubung ke PostgreSQL dan **frontend Next.js** yang berjalan di browser anggota.

---

## Perbandingan Versi Arsitektur

| Lapisan | V1 (Lama) | V2 (Aktif) | Keuntungan Utama |
|---|---|---|---|
| Frontend | Next.js 14 | Next.js 14 | Dynamic imports dan bundle splits yang dioptimalkan |
| Backend | NestJS 10 | NestJS 10 | Global Response Interceptor dan Exception Filter |
| Autentikasi | Firebase Auth | Better Auth | Kontrol sesi penuh, OAuth bawaan, performa lebih cepat |
| Database | Cloud Firestore | PostgreSQL via Prisma | Relasi data kuat, integritas tinggi, query cepat |
| Cache | — | Upstash Redis | Rate limiting dan caching leaderboard |
| Analytics | — | PostHog | Observabilitas perilaku pengguna secara real-time |
| Vector DB | — | Milvus | Pencarian semantik untuk fitur AI (RAG) |
| Font | Pinyon Script | Space Grotesk | Modern, keterbacaan tinggi di semua perangkat |
| CI/CD | — | GitHub Actions | Otomasi build, typecheck, lint, dan security scan |

> [!NOTE]
> Transisi arsitektur ini dirancang secara **non-breaking**. Fitur lama tetap berjalan melalui pola dual-write dan fallback ke Firestore.

---

## Setup Manual (Wajib Dilakukan Sekali)

Langkah-langkah berikut tidak dapat dilakukan secara otomatis karena memerlukan akses ke terminal lokal dan akun layanan cloud Anda.

### 1. Install Dependencies Backend

```bash
cd apps/api
npm install
```

Perintah ini akan menginstal paket V2 utama: `@upstash/redis`, `@prisma/client`, dan `prisma`.

### 2. Buat Database PostgreSQL

1. Daftar di [neon.tech](https://neon.tech) atau [supabase.com](https://supabase.com) (keduanya tersedia paket gratis).
2. Buat project baru dan salin **Connection String**.
3. Isi nilai `DATABASE_URL` dan `DIRECT_URL` di file `apps/api/.env`.

### 3. Jalankan Migrasi Prisma

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Setup Upstash Redis

1. Daftar di [console.upstash.com](https://console.upstash.com).
2. Buat database Redis baru (pilih region terdekat).
3. Salin `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` ke `apps/api/.env`.

### 5. Setup PostHog Analytics

1. Daftar di [posthog.com](https://posthog.com).
2. Salin Project API Key ke `apps/web/.env.local` sebagai `NEXT_PUBLIC_POSTHOG_KEY`.

---

## Konfigurasi Environment Variables

### Backend — `apps/api/.env`

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
WEB_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

# Cache
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Autentikasi
BETTER_AUTH_SECRET="buat-string-acak-panjang-minimal-32-karakter"
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Vector DB (AI)
MILVUS_ADDRESS="your-milvus-address"
MILVUS_TOKEN="your-milvus-token"

# Legacy Fallback (Firebase & Cloudinary)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
```

### Frontend — `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Legacy Fallback (Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## Menjalankan Aplikasi Secara Lokal

Buka dua terminal secara terpisah dan jalankan masing-masing:

```bash
# Terminal 1 — Backend NestJS (Port 3001)
cd apps/api
npm run dev

# Terminal 2 — Frontend Next.js (Port 3000)
cd apps/web
npm run dev
```

Atau jalankan keduanya sekaligus dari direktori root:

```bash
npm run dev
```

Akses aplikasi melalui browser di: `http://localhost:3000/landing`

---

## Struktur Proyek Monorepo

```
web-ua-newgame/
├── apps/
│   ├── api/                    # Backend NestJS (Port 3001)
│   │   ├── prisma/             # Skema dan migrasi database PostgreSQL
│   │   └── src/
│   │       ├── auth/           # Konfigurasi Better Auth
│   │       ├── database/       # PrismaService provider global
│   │       ├── common/         # Guard, Interceptor, Decorator, Filter
│   │       └── modules/        # 21 modul fitur bisnis UKM
│   │
│   └── web/                    # Frontend Next.js (Port 3000)
│       └── src/
│           ├── app/
│           │   ├── dev-tools/  # Web Mobile Simulator (internal developer)
│           │   ├── landing/    # Halaman publik (Space Grotesk)
│           │   └── (dashboard)/# Portal gamifikasi terproteksi
│           ├── components/     # UI, ErrorBoundary, PostHogProvider
│           └── lib/            # PostHog, API client, theme engine
│
├── tools/
│   └── mobile-simulator/       # Aplikasi Flutter Desktop preview
├── scripts/
│   └── audit.mjs               # Script audit mandiri codebase
└── .github/
    └── workflows/ci.yml        # GitHub Actions CI/CD pipeline
```

---

## Dokumen Pendukung

| Dokumen | Deskripsi |
|---|---|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Standar penulisan kode, konvensi, dan alur kontribusi Git |
| [DOCS.md](./DOCS.md) | Matriks role, skema database Prisma, dan format API response |
| [SECURITY.md](./SECURITY.md) | Arsitektur keamanan berlapis, rate limiting, dan WAF |
| [MEMBER_REGISTRATION.md](./MEMBER_REGISTRATION.md) | Panduan registrasi anggota baru dan penambahan member oleh admin |
| [ACCOUNT_GUIDE.md](./ACCOUNT_GUIDE.md) | Alur pendaftaran akun, Member ID, dan Kode Akses |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat lengkap pembaruan platform dari awal hingga V2 |

---

*MIT License — 2026 NEWGAME, UKM Game Development Universitas Andalas*