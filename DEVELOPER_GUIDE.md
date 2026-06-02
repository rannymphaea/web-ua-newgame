# Panduan Developer NEWGAME V2

Dokumen ini ditujukan bagi siapa saja yang ingin berkontribusi dalam pengembangan platform **NEWGAME V2** Universitas Andalas. Silakan baca panduan ini dari awal secara saksama sebelum mulai menulis kode agar arsitektur monorepo tetap konsisten dan terjaga kekokohannya.

---

## 🛠️ Stack Arsitektur V2

Platform ini menggunakan pola pengembangan monorepo dengan teknologi utama sebagai berikut:
- **Frontend**: Next.js 14 (App Router) + Vanilla CSS (Design Tokens)
- **Backend**: NestJS 10 (Rest API)
- **Database Relasional**: PostgreSQL (diakses melalui **Prisma ORM**)
- **Database Dokumen**: Cloud Firestore (Legacy / Dual-Write fallback)
- **Cache & Rate Limiting**: Upstash Redis (Serverless Redis REST)
- **Analytics & Observabilitas**: PostHog SDK
- **Pencarian Semantik (AI)**: Milvus / Zilliz Cloud SDK

---

## 📂 Struktur Monorepo Terkini

```
apps/
├── api/                       # Backend NestJS (Port 3001)
│   ├── prisma/                # Schema database dan migrasi PostgreSQL
│   └── src/
│       ├── auth/              # Konfigurasi Better Auth
│       ├── database/          # Global DatabaseModule (PrismaService)
│       ├── common/            # Guard, Decorator, Interceptor, Exception Filter
│       └── modules/           # Modul bisnis (attendance, xp, news, dll)
│
└── web/                       # Frontend Next.js (Port 3000)
    └── src/
        ├── app/               # Next.js App Router Pages
        │   ├── dev-tools/     # Web-based Mobile Simulator
        │   ├── landing/       # Halaman publik (Space Grotesk)
        │   └── (dashboard)/   # Halaman terproteksi (Zustand Auth)
        ├── components/        # Komponen UI, ErrorBoundary, PostHogProvider
        ├── lib/               # Integrasi PostHog, API client, Firebase client
        └── styles/            # globals.css (Design tokens & animations)
```

---

## 🔒 Aturan Pengeditan File (Strict Guidelines)

Untuk menghindari kerusakan build atau kebocoran kredensial, perhatikan penanda komentar dan instruksi berikut:

### 1. Penanda Khusus di Codebase
* `// ALLOWED` — Bagian yang aman untuk dimodifikasi oleh developer baru (seperti teks statis, CSS visual, atau penambahan data mock).
* `// DO NOT EDIT` — Bagian krusial sistem (koneksi database, global middleware, core service, atau file konfigurasi utama). Modifikasi hanya boleh dilakukan melalui PR review ketat.

### 2. File yang Memerlukan Perhatian Khusus
* **`apps/api/src/main.ts`** — Titik masuk NestJS. Berisi konfigurasi global prefix `api`, CORS, global exception filters (`AllExceptionsFilter`), dan global response interceptor (`ResponseInterceptor`).
* **`apps/web/next.config.js`** — Berisi optimasi bundle Next.js (`optimizePackageImports` untuk framer-motion, recharts, zustand, dll.) dan `staleTimes` untuk manajemen cache.
* **`apps/api/prisma/schema.prisma`** — Berisi deklarasi tabel PostgreSQL. Perubahan di sini wajib diikuti dengan pembuatan berkas migrasi baru via `npx prisma migrate dev`.

---

## 💾 Manajemen Database & Data Migrasi

Sistem saat ini berada dalam masa transisi hybrid dari Firestore ke PostgreSQL.

### Menambahkan Model Baru di PostgreSQL
1. Buka file `apps/api/prisma/schema.prisma`.
2. Tulis model baru dengan penamaan PascalCase (petakan ke tabel plural berhuruf kecil menggunakan `@@map`):
   ```prisma
   model ActivityLog {
     id        String   @id @default(cuid())
     userId    String
     action    String
     createdAt DateTime @default(now())
     
     @@map("activity_logs")
   }
   ```
3. Lakukan sinkronisasi database lokal Anda:
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma migrate dev --name tambah_activity_logs
   ```

### dual-write Pattern
Saat melakukan mutasi data penting (misal: pendaftaran user atau update XP), pastikan Anda menulis ke PostgreSQL melalui `PrismaService` dan tetap menulis ke Firestore sebagai backup (jika modul PostgreSQL belum sepenuhnya diaktifkan di production). Gunakan fallback yang aman (try-catch block) agar kegagalan salah satu database tidak menghentikan flow aplikasi utama.

---

## 📏 Standar Penulisan Kode (Lint & Coding Standards)

Proyek ini menerapkan TypeScript Strict Mode secara menyeluruh. Aturan wajib:

* **No Implicit Any**: Hindari penggunaan tipe `any`. Jika tipe data tidak diketahui pasti pada saat runtime, gunakan `unknown` diikuti dengan type narrowing (`instanceof` atau custom type guards).
* **Indentasi**: Selalu gunakan **2 spasi** (bukan tab).
* **Quotes**: Gunakan single quote (`'`) untuk file TypeScript, dan double quote (`"`) untuk JSX attributes atau file JSON.
* **Trailing Commas**: Selalu gunakan trailing comma pada objek atau array multiline demi kebersihan git diff saat review.

### Konvensi Penamaan:
* **Komponen & Interface**: `PascalCase` (contoh: `LeaderboardTable`, `ApiResponse`)
* **Variabel & Fungsi**: `camelCase` (contoh: `getLeaderboardData`, `xpGained`)
* **Konstanta & Enum**: `SCREAMING_SNAKE_CASE` (contoh: `MAX_RETRY_ATTEMPTS`)
* **Nama File / Folder**: `kebab-case` (contoh: `pirate-map.tsx`, `vector.service.ts`)
* **Tabel PostgreSQL**: `plural_snake_case` (contoh: `user_profiles`)

---

## 🔀 Alur Git & Kontribusi

Semua kontribusi kode harus melalui percabangan fitur dan Pull Request. **Jangan pernah melakukan push langsung ke branch `main`.**

### Langkah-langkah Kontribusi:
1. Pastikan repositori lokal Anda sinkron:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Buat branch baru dari `main`:
   ```bash
   git checkout -b feature/nama-fitur-baru
   # atau fix/deskripsi-perbaikan
   ```
3. Lakukan modifikasi kode. Sebelum commit, pastikan project dapat ter-build tanpa error:
   ```bash
   npm run build
   ```
4. Commit dengan format pesan konvensional:
   ```
   feat(xp): tambah animasi wave bar liquid di TopBar
   fix(auth): perbaiki validasi token yang bocor di logs
   docs(readme): perbarui panduan setup manual V2
   ```
5. Push branch Anda dan buat Pull Request (PR) di GitHub. Pipeline GitHub Actions CI/CD akan berjalan otomatis untuk mengecek type-safety, security audit, dan kebersihan kode.
