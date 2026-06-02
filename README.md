<div align="center">
  <img src="apps/web/public/logo.png" alt="NEWGAME" width="80" />

  <h1>NEWGAME V2</h1>
  <p>Platform web UKM Game Development — Universitas Andalas</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis" alt="Redis" />
    <a href="https://unandnewgame-tan.vercel.app"><img src="https://img.shields.io/badge/Web-unandnewgame--tan.vercel.app-black?logo=vercel" alt="Web Live" /></a>
  </p>
</div>

---

## 🚀 Ringkasan Arsitektur V2

Platform NEWGAME telah ditingkatkan ke **Arsitektur V2** untuk meningkatkan skalabilitas, keandalan, observabilitas, serta dukungan fitur AI. 

> [!NOTE]
> Transisi arsitektur ini dirancang secara **non-breaking** (fitur lama tetap berjalan berdampingan) menggunakan pattern dual-write/fallback.

### Perbandingan Stack Teknologi

| Lapisan | V1 (Lama) | V2 (Baru - Aktif Sekarang) | Keuntungan Utama |
|---|---|---|---|
| **Frontend** | Next.js 14 | Next.js 14 | Dioptimalkan dengan dynamic imports & bundle splits |
| **Backend** | NestJS 10 | NestJS 10 | Ditambah global Response Interceptor & Exception Filters |
| **Auth** | Firebase Auth | **Better Auth** *(Code-Ready)* | Kendali sesi penuh, performa lebih cepat, OAuth bawaan |
| **Database** | Cloud Firestore | **PostgreSQL** (Neon/Supabase) | Relasi data yang kuat, integritas data tinggi, query cepat |
| **Cache** | — | **Upstash Redis** *(Code-Ready)* | Rate limiting endpoint API & caching leaderboard |
| **Analytics** | — | **PostHog** *(Code-Ready)* | Observabilitas perilaku user & pelacakan event otomatis |
| **Vector DB** | — | **Milvus** *(Code-Ready)* | Pencarian semantik cerdas (RAG) untuk AI |
| **Font Utama** | Pinyon Script | **Space Grotesk** | Desain modern, keterbacaan tinggi di semua device |
| **CI/CD** | — | **GitHub Actions** | Otomasi build, typecheck, lint, & security scan |

---

## 🛠️ SETUP MANUAL (DI LUAR KEMAMPUAN AI)

Karena AI tidak memiliki akses ke terminal lokal Anda secara langsung, akun cloud eksternal, atau kredensial rahasia Anda, **Anda wajib melakukan langkah-langkah berikut** untuk mengaktifkan modul V2 secara penuh:

### 🔴 WAJIB (Sebelum V2 Dapat Berjalan)

#### 1. Install Dependencies Backend
Masuk ke terminal dan jalankan install di root atau sub-workspace:
```bash
cd apps/api
npm install
# Ini menginstall package V2: @upstash/redis, @prisma/client, dan prisma
```

#### 2. Buat Database PostgreSQL
1. Daftar akun di [neon.tech](https://neon.tech) atau [supabase.com](https://supabase.com) (keduanya gratis).
2. Buat project baru dan salin Connection String (`DATABASE_URL` dan `DIRECT_URL`).
3. Buat file `apps/api/.env` (jika belum ada) dan isi nilainya (lihat template di bawah).

#### 3. Jalankan Prisma Migration
Jalankan perintah ini untuk membuat tabel-tabel V2 di database PostgreSQL Anda:
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
```

#### 4. Buat Akun & Setup Upstash Redis (Caching + Rate Limit)
1. Daftar di [console.upstash.com](https://console.upstash.com).
2. Buat database Redis baru (pilih region terdekat).
3. Salin `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` ke `apps/api/.env`.

#### 5. Buat Akun & Setup PostHog (Analytics)
1. Daftar di [posthog.com](https://posthog.com).
2. Salin Project API Key (`NEXT_PUBLIC_POSTHOG_KEY`) dan Host ke `apps/web/.env.local`.

---

## 📝 Konfigurasi Environment Variables (.env)

### Backend (`apps/api/.env`)
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
WEB_URL=http://localhost:3000

# === DATABASE ===
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

# === UPSTASH REDIS ===
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# === BETTER AUTH ===
BETTER_AUTH_SECRET="buat-string-acak-panjang-minimal-32-karakter"
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# === MILVUS VECTOR DB ===
MILVUS_ADDRESS="your-milvus-address"
MILVUS_TOKEN="your-milvus-token"

# === LEGACY/V1 FALLBACK (Firebase & Cloudinary) ===
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# === POSTHOG ANALYTICS ===
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# === LEGACY/V1 FALLBACK (Firebase) ===
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## 🏃 Menjalankan Aplikasi Secara Lokal

Setelah semua setup manual di atas selesai:

```bash
# Terminal 1 — Jalankan API Backend (NestJS, Port 3001)
cd apps/api
npm run dev

# Terminal 2 — Jalankan Web Frontend (Next.js, Port 3000)
cd apps/web
npm run dev
```

Akses aplikasi melalui browser di [http://localhost:3000/landing](http://localhost:3000/landing).

---

## 📂 Struktur Proyek Monorepo

```
web-ua-newgame/
├── apps/
│   ├── api/                    # Backend NestJS (V2)
│   │   ├── prisma/             # Schema & database migrations
│   │   └── src/
│   │       ├── auth/           # Better Auth configuration
│   │       ├── database/       # Prisma service provider
│   │       ├── common/         # Rate limits, interceptors, error filters
│   │       └── modules/        # 21 Modul fitur UKM
│   │
│   └── web/                    # Frontend Next.js (V2)
│       └── src/
│           ├── app/
│           │   ├── dev-tools/  # Web Mobile Simulator interaktif
│           │   ├── landing/    # Landing page dengan Space Grotesk
│           │   └── dashboard/  # Portal gamefied dashboard
│           ├── components/     # UI, ErrorBoundary, PostHogProvider
│           └── lib/            # PostHog integration & API helpers
│
├── tools/
│   └── mobile-simulator/       # Flutter Desktop Simulator
├── scripts/
│   └── audit.mjs               # Script audit mandiri codebase
└── .github/workflows/ci.yml    # GitHub Actions Pipeline
```

---

## 📑 Panduan Pendukung Lainnya

Silakan baca dokumen pendukung berikut untuk informasi lebih spesifik:
- 📖 [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) — Aturan penulisan kode, standarisasi type, dan flow git.
- 🔑 [ACCOUNT_GUIDE.md](./ACCOUNT_GUIDE.md) — Alur registrasi anggota, Member ID, & Kode Akses.
- 📔 [DOCS.md](./DOCS.md) — Matrix Role superadmin/admin/member & skema database Prisma/Firestore.
- 🛡️ [SECURITY.md](./SECURITY.md) — Implementasi WAF, in-memory rate limiting, dan log forensik.
- 📝 [CHANGELOG.md](./CHANGELOG.md) — Catatan riwayat update fitur dari awal hingga V2.

---

MIT © 2026 NEWGAME — Universitas Andalas