# Panduan Developer — NEWGAME V2

Dokumen ini adalah referensi utama bagi setiap developer yang berkontribusi pada platform **NEWGAME V2**. Bacalah seluruh panduan ini sebelum menulis kode pertama Anda untuk memastikan konsistensi arsitektur monorepo terjaga.

---

## Stack Teknologi

| Lapisan | Teknologi | Keterangan |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Styling dengan Vanilla CSS dan Design Tokens |
| Backend | NestJS 10 (REST API) | Global interceptor, filter, dan guard |
| Database Relasional | PostgreSQL via Prisma ORM | Skema terpusat di `apps/api/prisma/schema.prisma` |
| Database Dokumen | Cloud Firestore | Legacy, digunakan sebagai dual-write fallback |
| Cache & Rate Limiting | Upstash Redis (Serverless REST) | Caching leaderboard dan mitigasi brute force |
| Analytics | PostHog SDK | Perekaman pageview dan pelacakan event CTA |
| Pencarian Semantik | Milvus / Zilliz Cloud | Vector DB untuk fitur AI berbasis embedding |

---

## Struktur Monorepo

```
apps/
├── api/                        # Backend NestJS (Port 3001)
│   ├── prisma/                 # Skema database dan file migrasi PostgreSQL
│   └── src/
│       ├── auth/               # Konfigurasi Better Auth
│       ├── database/           # Global DatabaseModule (PrismaService)
│       ├── common/             # Guard, Decorator, Interceptor, Exception Filter
│       └── modules/            # Modul bisnis: attendance, xp, news, members, dll
│
└── web/                        # Frontend Next.js (Port 3000)
    └── src/
        ├── app/                # Next.js App Router Pages
        │   ├── dev-tools/      # Web Mobile Simulator (internal developer)
        │   ├── landing/        # Halaman publik (Space Grotesk)
        │   └── (dashboard)/    # Portal terproteksi (Zustand Auth Store)
        ├── components/         # Komponen UI, ErrorBoundary, PostHogProvider
        ├── lib/                # Integrasi PostHog, API client, Firebase client
        └── styles/             # globals.css — design tokens dan animasi global
```

---

## Aturan Pengeditan File

### Penanda Komentar di Codebase

Setiap file krusial diberi penanda komentar yang harus dipatuhi:

| Penanda | Arti |
|---|---|
| `// ALLOWED` | Bagian aman untuk dimodifikasi: teks statis, CSS visual, data mock |
| `// DO NOT EDIT` | Bagian krusial sistem: koneksi database, middleware global, konfigurasi inti |

### File yang Memerlukan Perhatian Khusus

**`apps/api/src/main.ts`**
Titik masuk NestJS. Berisi konfigurasi global prefix `api`, CORS, in-memory rate limiter, global exception filter (`AllExceptionsFilter`), dan global response interceptor (`ResponseInterceptor`). Tidak boleh dimodifikasi tanpa review ketat.

**`apps/web/next.config.js`**
Berisi optimasi bundle (`optimizePackageImports` untuk framer-motion, recharts, zustand) dan konfigurasi `staleTimes` untuk cache. Perubahan dapat memengaruhi performa build secara signifikan.

**`apps/api/prisma/schema.prisma`**
Deklarasi seluruh tabel PostgreSQL. Setiap perubahan di sini wajib diikuti dengan pembuatan file migrasi baru menggunakan perintah `npx prisma migrate dev`.

---

## Manajemen Database

### Menambahkan Model Baru di PostgreSQL

1. Buka `apps/api/prisma/schema.prisma`.
2. Tulis model baru dengan penamaan `PascalCase` dan petakan ke tabel plural snake_case menggunakan `@@map`:

```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  createdAt DateTime @default(now())

  @@map("activity_logs")
}
```

3. Sinkronkan database lokal Anda:

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name tambah_activity_logs
```

### Pola Dual-Write

Saat melakukan mutasi data penting (contoh: pendaftaran user, update XP), tulis ke **PostgreSQL via PrismaService** terlebih dahulu, kemudian tulis ke **Firestore** sebagai backup. Gunakan blok `try-catch` yang terpisah agar kegagalan salah satu database tidak menghentikan alur utama aplikasi.

```typescript
// Contoh pola dual-write yang aman
async updateUserXp(userId: string, xpGained: number) {
  try {
    await this.prisma.userProfile.update({
      where: { userId },
      data: { exp: { increment: xpGained } },
    });
  } catch (pgError) {
    this.logger.error('PostgreSQL update gagal', pgError);
  }

  try {
    await this.firebase.firestore
      .collection('users')
      .doc(userId)
      .update({ xpCache: FieldValue.increment(xpGained) });
  } catch (fbError) {
    this.logger.warn('Firestore fallback gagal', fbError);
  }
}
```

---

## Standar Penulisan Kode

Proyek ini mengaktifkan **TypeScript Strict Mode** secara menyeluruh.

### Aturan Wajib

- **No Implicit Any** — Hindari tipe `any`. Gunakan `unknown` diikuti type narrowing jika tipe runtime tidak diketahui.
- **Indentasi** — Gunakan **2 spasi**, bukan tab.
- **Quotes** — Single quote (`'`) untuk TypeScript, double quote (`"`) untuk JSX attributes dan JSON.
- **Trailing Commas** — Selalu gunakan trailing comma pada objek atau array multiline untuk kebersihan git diff.

### Konvensi Penamaan

| Konteks | Gaya | Contoh |
|---|---|---|
| Komponen & Interface | `PascalCase` | `LeaderboardTable`, `ApiResponse` |
| Variabel & Fungsi | `camelCase` | `getLeaderboardData`, `xpGained` |
| Konstanta & Enum | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS` |
| Nama File & Folder | `kebab-case` | `pirate-map.tsx`, `vector.service.ts` |
| Tabel PostgreSQL | `plural_snake_case` | `user_profiles`, `activity_logs` |

---

## Alur Git dan Kontribusi

> [!IMPORTANT]
> Jangan pernah melakukan push langsung ke branch `main`. Semua perubahan harus melalui Pull Request.

### Langkah Kontribusi

**Langkah 1.** Sinkronkan repositori lokal Anda:
```bash
git checkout main
git pull origin main
```

**Langkah 2.** Buat branch fitur baru dari `main`:
```bash
git checkout -b feature/nama-fitur-baru
# atau: fix/deskripsi-perbaikan
```

**Langkah 3.** Setelah selesai menulis kode, pastikan project dapat di-build tanpa error:
```bash
npm run build
```

**Langkah 4.** Commit dengan format pesan konvensional:
```
feat(xp): tambah animasi wave bar liquid di TopBar
fix(auth): perbaiki validasi token yang bocor di logs
docs(readme): perbarui panduan setup manual V2
```

**Langkah 5.** Push branch dan buat Pull Request di GitHub. Pipeline GitHub Actions CI/CD akan berjalan otomatis untuk mengecek type-safety, security audit, dan kebersihan kode.

---

## Referensi Cepat Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan API dan Web secara bersamaan dari root |
| `npm run dev:api` | Menjalankan backend saja (Port 3001) |
| `npm run dev:web` | Menjalankan frontend saja (Port 3000) |
| `npx prisma studio` | Membuka antarmuka visual database Prisma |
| `npx prisma migrate dev` | Membuat dan menjalankan migrasi baru |
| `npx prisma generate` | Regenerasi Prisma Client dari schema |
| `npm run build` | Build production untuk API dan Web |
