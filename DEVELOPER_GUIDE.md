# Panduan Developer â€” NEWGAME v0.1.1

Dokumen ini adalah referensi utama bagi setiap developer yang berkontribusi pada platform NEWGAME v0.1.1. Bacalah seluruh panduan ini sebelum menulis kode pertama Anda untuk memastikan konsistensi arsitektur monorepo terjaga.

---

### Stack Teknologi

| Lapisan | Teknologi | Keterangan |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Styling dengan Vanilla CSS dan Design Tokens |
| Backend | NestJS 10 (REST API) | Global interceptor, filter, dan guard |
| Database Relasional | PostgreSQL via Prisma ORM | Skema terpusat di `apps/api/prisma/schema.prisma` |
| Database Dokumen | Cloud Firestore | Legacy, digunakan sebagai dual-write fallback |
| Cache dan Rate Limiting | Upstash Redis (Serverless REST) | Caching leaderboard dan mitigasi brute force |
| Analytics | PostHog SDK | Perekaman pageview dan pelacakan event CTA |
| Pencarian Semantik | Milvus / Zilliz Cloud | Vector DB untuk fitur AI berbasis embedding |

---

### Struktur Monorepo

```
apps/
â”œâ”€â”€ api/                        # Backend NestJS (Port 3001)
â”‚   â”œâ”€â”€ prisma/                 # Skema database dan file migrasi PostgreSQL
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ auth/               # Konfigurasi Better Auth
â”‚       â”œâ”€â”€ database/           # Global DatabaseModule (PrismaService)
â”‚       â”œâ”€â”€ common/             # Guard, Decorator, Interceptor, Exception Filter
â”‚       â””â”€â”€ modules/            # Modul bisnis: attendance, xp, news, members, dll
â”‚
â””â”€â”€ web/                        # Frontend Next.js (Port 3000)
    â””â”€â”€ src/
        â”œâ”€â”€ app/                # Next.js App Router Pages
        â”‚   â”œâ”€â”€ dev-tools/      # Web Mobile Simulator (internal developer)
        â”‚   â”œâ”€â”€ landing/        # Halaman publik
        â”‚   â””â”€â”€ (dashboard)/    # Portal terproteksi (Zustand Auth Store)
        â”œâ”€â”€ components/         # Komponen UI, ErrorBoundary, PostHogProvider
        â”œâ”€â”€ lib/                # Integrasi PostHog, API client, Firebase client
        â””â”€â”€ styles/             # globals.css â€” design tokens dan animasi global
```

---

### Aturan Pengeditan File

Setiap file krusial diberi penanda komentar yang wajib dipatuhi:

| Penanda | Arti |
|---|---|
| `// ALLOWED` | Aman untuk dimodifikasi: teks statis, CSS visual, data mock |
| `// DO NOT EDIT` | Krusial sistem: koneksi database, middleware global, konfigurasi inti |

File yang memerlukan perhatian khusus:

`apps/api/src/main.ts` â€” Titik masuk NestJS. Berisi konfigurasi global prefix `api`, CORS, in-memory rate limiter, global exception filter, dan global response interceptor. Tidak boleh dimodifikasi tanpa review ketat.

`apps/web/next.config.js` â€” Berisi optimasi bundle dan konfigurasi cache. Perubahan dapat memengaruhi performa build secara signifikan.

`apps/api/prisma/schema.prisma` â€” Deklarasi seluruh tabel PostgreSQL. Setiap perubahan wajib diikuti pembuatan file migrasi baru.

---

### Manajemen Database

#### Menambahkan Model Baru di PostgreSQL

1. Buka `apps/api/prisma/schema.prisma`.
2. Tulis model baru dengan penamaan PascalCase dan petakan ke tabel plural snake_case:

```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  createdAt DateTime @default(now())

  @@map("activity_logs")
}
```

3. Sinkronkan database lokal:

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name tambah_activity_logs
```

#### Pola Dual-Write

Saat melakukan mutasi data penting, tulis ke PostgreSQL via PrismaService terlebih dahulu, kemudian tulis ke Firestore sebagai backup. Gunakan blok `try-catch` terpisah agar kegagalan satu database tidak menghentikan alur utama.

```typescript
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

### Standar Penulisan Kode

Proyek mengaktifkan TypeScript Strict Mode secara menyeluruh.

Aturan wajib:

- No Implicit Any â€” Hindari tipe `any`. Gunakan `unknown` diikuti type narrowing jika tipe runtime tidak diketahui.
- Indentasi â€” Gunakan 2 spasi, bukan tab.
- Quotes â€” Single quote untuk TypeScript, double quote untuk JSX attributes dan JSON.
- Trailing Commas â€” Selalu gunakan trailing comma pada objek atau array multiline.

Konvensi penamaan:

| Konteks | Gaya | Contoh |
|---|---|---|
| Komponen dan Interface | PascalCase | `LeaderboardTable`, `ApiResponse` |
| Variabel dan Fungsi | camelCase | `getLeaderboardData`, `xpGained` |
| Konstanta dan Enum | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Nama File dan Folder | kebab-case | `pirate-map.tsx`, `vector.service.ts` |
| Tabel PostgreSQL | plural_snake_case | `user_profiles`, `activity_logs` |

---

### Alur Git dan Kontribusi

> [!IMPORTANT]
> Jangan pernah melakukan push langsung ke branch `main`. Semua perubahan harus melalui Pull Request.

Langkah 1 â€” Sinkronkan repositori lokal:
```bash
git checkout main
git pull origin main
```

Langkah 2 â€” Buat branch fitur baru:
```bash
git checkout -b feature/nama-fitur-baru
```

Langkah 3 â€” Pastikan project dapat di-build tanpa error:
```bash
npm run build
```

Langkah 4 â€” Commit dengan format pesan konvensional:
```
feat(xp): tambah animasi wave bar liquid di TopBar
fix(auth): perbaiki validasi token yang bocor di logs
docs(readme): perbarui panduan setup manual v0.1.1
```

Langkah 5 â€” Push branch dan buat Pull Request di GitHub. Pipeline GitHub Actions akan berjalan otomatis untuk mengecek type-safety, security audit, dan kebersihan kode.

---

### Referensi Perintah Cepat

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan API dan Web secara bersamaan dari root |
| `npm run dev:api` | Menjalankan backend saja (Port 3001) |
| `npm run dev:web` | Menjalankan frontend saja (Port 3000) |
| `npx prisma studio` | Membuka antarmuka visual database Prisma |
| `npx prisma migrate dev` | Membuat dan menjalankan migrasi baru |
| `npx prisma generate` | Regenerasi Prisma Client dari schema |
| `npm run build` | Build production untuk API dan Web |

---

### Matriks Peran dan Izin Akses

Platform mengadopsi 6 tingkatan role berbasis hierarki organisasi:

| Peran | Kemampuan Utama | Level Akses |
|---|---|---|
| OWNER | Kendali penuh infrastruktur, billing, dan semua pengaturan sistem | Level 5 |
| ADMIN | Manajemen role user, log forensik, dasbor AI analytics | Level 4 |
| TRAINER | Manajemen modul belajar, pembuatan event, input absensi manual | Level 3 |
| SOLDAT | Membuat artikel berita, mengelola galeri media | Level 2 |
| ASSOCIATE | Anggota tingkat lanjut, akses modul proyek khusus | Level 1 |
| TRAINEE | Anggota baru. Akses absensi, leaderboard, dan riwayat XP | Level 0 |

---

### Standar Respons API

Semua endpoint REST API diproses melalui `ResponseInterceptor` global di `main.ts`.

#### Respons Sukses
```json
{ "success": true, "data": { "id": "cuid-user-123", "email": "trainee@newgame.ac.id" }, "timestamp": "2026-06-02T09:30:00.000Z" }
```

#### Endpoint Utama

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/verify-member` | Publik | Verifikasi Member ID dan kode akses |
| POST | `/api/auth/register` | Authenticated | Buat profil setelah Firebase Auth |
| GET | `/api/auth/me` | Authenticated | Ambil profil user yang login |
| POST | `/api/auth/set-role` | Admin/Owner | Ubah role user |
| GET | `/api/members` | Admin/Owner | Daftar semua anggota |
| PATCH | `/api/members/:uid` | Admin/Owner | Perbarui data anggota |

---

### Strategi Caching (Upstash Redis)

| Kunci Cache | Data | TTL |
|---|---|---|
| `leaderboard:all` | Data leaderboard global | 60 detik |
| `news:published` | Daftar artikel berita publik | 300 detik |
| `user:{id}:profile` | Profil detail per pengguna | 60 detik |
| `ip:{address}:count` | Counter rate limiter per IP | 60 detik |

---

### Alur Autentikasi Firebase

1. **Email/Password** â€” Setelah login, `auth.currentUser` tersedia via Firebase Auth.
2. **Google OAuth** â€” Callback URL production: `https://unandnewgame-tan.vercel.app`
3. **Auth Guard** â€” `useAuthStore` (Zustand) menjaga semua route dashboard.
4. **Token Refresh** â€” Token Firebase di-refresh otomatis setiap 10 menit via interval di `auth-store.ts`.