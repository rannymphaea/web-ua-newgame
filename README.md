<div align="center">
  <img src="apps/web/public/logo.png" alt="NEWGAME" width="72" />

  <h1>NEWGAME v0.1.4</h1>
  <p>Platform Web UKM Game Development — Universitas Andalas</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Firebase-Aktif-orange?logo=firebase" alt="Firebase" />
    <img src="https://img.shields.io/badge/PostgreSQL-Siap_Migrasi-336791?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Versi-0.1.3-6366f1" alt="Versi" />
    <a href="https://unandnewgame-tan.vercel.app"><img src="https://img.shields.io/badge/Live-unandnewgame--tan.vercel.app-black?logo=vercel" alt="Live" /></a>
  </p>
</div>

---

## Status Arsitektur (Per Juni 2026)

| Komponen | Status | Keterangan |
|---|---|---|
| **Firebase Firestore** | âœ… Aktif | Sumber data utama produksi |
| **Firebase Auth** | âœ… Aktif | Autentikasi login semua anggota |
| **PostgreSQL (local)** | âœ… Schema tersinkron | `npx prisma db push` sudah dijalankan, **data belum dimigrasikan** |
| **Prisma Client** | âœ… Generated | v5.22.0, terhubung ke `newgame` di localhost |
| **Upstash Redis** | âœ… Aktif | Rate limiting & leaderboard cache |
| **Cloudinary** | âœ… Aktif | Upload media |
| **Vercel** | âœ… Deployed | Frontend + API serverless |

> **Catatan migrasi:** Firestore masih menjadi sumber data utama. PostgreSQL sudah disiapkan dan skema sudah tersinkron, tetapi data belum dipindahkan. Lihat [MIGRATION.md](./MIGRATION.md) untuk panduan cutover.

---

## Ringkasan

NEWGAME adalah platform web terpadu UKM Game Development Universitas Andalas yang mengelola:
- **125 anggota** aktif (GEN 1 dan GEN 2)
- Presensi berbasis QR code + gamifikasi XP
- Leaderboard, lencana, berita internal
- Panel admin untuk pengurus

**Firebase Project:** `qr-absensi-unandnewgame`

---

## Struktur Data Firestore (Aktif)

| Collection | Isi |
|---|---|
| `members` | Data administrasi anggota â€” Member ID, nama, pilar, kode akses |
| `users` | Akun login â€” email, role, XP, avatar, status |
| `events` | Data event â€” nama, waktu, XP reward, status aktif |
| `attendance` | Riwayat presensi per anggota per event |
| `tokens` | QR token untuk presensi |
| `logs` | Forensic activity log |
| `media` | Referensi file media (Cloudinary) |
| `user_history` | Timeline aktivitas anggota |
| `user_vault` | Data sensitif anggota |

---

## Struktur Aset

### `storage/` â€” Aset Master (Sumber)

Direktori ini menyimpan file sumber beresolusi tinggi. **Jangan diimport langsung ke kode Next.js.**

```
storage/
â”œâ”€â”€ characters/      # Karakter OC NEWGAME (PNG + SVG resolusi tinggi)
â”‚   â”œâ”€â”€ CodeCommandColourOutlined.{png,svg}   # Code Commander OC
â”‚   â”œâ”€â”€ goldGuardianColourOutlined.{png,svg}  # Gold Guardian OC
â”‚   â”œâ”€â”€ sekumColourOutlined.{png,svg}          # Quest Keeper OC
â”‚   â”œâ”€â”€ colourOutlined.{png,svg}               # Karakter umum
â”‚   â”œâ”€â”€ yua.{png,svg}                          # Maskot Yua
â”‚   â””â”€â”€ logo.{png,svg}                         # Logo resolusi tinggi
â”œâ”€â”€ logo/            # Variasi logo untuk branding eksternal
â””â”€â”€ sfx/             # Audio source sebelum kompresi
```

### `apps/web/public/` â€” Aset Web (Deploy)

```
public/
â”œâ”€â”€ logo.png                   # Favicon / PWA icon (19 KB)
â”œâ”€â”€ manifest.json              # PWA manifest
â”œâ”€â”€ images/
â”‚   â”œâ”€â”€ logo.svg               # Logo untuk sidebar
â”‚   â””â”€â”€ characters/            # OC SVG siap web
â”‚       â”œâ”€â”€ oc-cmd.svg         # Code Commander (dipakai di /scan, /calendar)
â”‚       â”œâ”€â”€ oc-gold.svg        # Gold Guardian
â”‚       â”œâ”€â”€ oc-hero.svg        # Hero OC
â”‚       â”œâ”€â”€ oc-read.svg        # Quest Keeper / Sekum
â”‚       â””â”€â”€ yua.svg            # Maskot Yua (dipakai di /dashboard, /profile, /landing)
â””â”€â”€ assets/sfx/
    â””â”€â”€ yua-select.mp3         # SFX klik karakter Yua
```

> Semua path gambar di kode menggunakan prefix `/images/characters/` atau `/images/`.
> Contoh: `<img src="/images/characters/yua.svg" />`

---

## Kustomisasi Sidebar & Pirate Map

Menu sidebar didefinisikan di [`apps/web/src/components/layout/Sidebar.tsx`](./apps/web/src/components/layout/Sidebar.tsx) dalam array `NAV_ITEMS`.

**Item Pirate Map** adalah menu yang **dapat diubah oleh pengurus** ke depannya:
- Route (`href`) bisa diganti sesuai kebutuhan
- Label dan ikon bisa dikustomisasi
- Saat ini mengarah ke `/pirate-map` (roadmap perjalanan anggota)

Untuk menambah, menghapus, atau mengganti item menu:
```typescript
// apps/web/src/components/layout/Sidebar.tsx â€” NAV_ITEMS
{ href: '/pirate-map', label: 'Pirate Map', icon: 'ri-map-2-line',
  roles: ['member', 'admin', ...] },
// Ganti href, label, atau icon sesuai kebutuhan
```

Akses tiap item dikontrol oleh field `roles` menggunakan nama role dari [`constants/roles.ts`](./apps/api/src/common/constants/roles.ts).

---

## Struktur Data PostgreSQL (Siap, Belum Diisi)

Schema tersinkron via `prisma migrate deploy`. Tabel yang tersedia:

| Tabel | Model Prisma |
|---|---|
| `users` | `User` |
| `user_profiles` | `UserProfile` |
| `sessions` | `Session` |
| `events` | `Event` |
| `attendances` | `Attendance` |
| `news_articles` | `NewsArticle` |
| `xp_history` | `XpHistory` |
| `activities` | `Activity` |
| `notifications` | `Notification` |

---

## Sistem Role (Application Layer)

Sistem role di aplikasi (RolesGuard) menggunakan 8 level berikut:

| Role | Level | Akses |
|---|---|---|
| `npc` | 0 | Halaman publik saja, belum diverifikasi |
| `member` | 1 | Dashboard, presensi, profil |
| `inventori` | 2 | + Manajemen inventori |
| `admin` | 3 | + Kelola member, event, berita |
| `quest keeper` | 4 | + Ekspor data, laporan |
| `gold guardian` | 5 | + Manajemen keuangan |
| `code commander` | 6 | + Kelola role, buat admin |
| `pixel presiden` | 7 | Akses penuh |

> Permission matrix lengkap: [`apps/api/src/common/constants/roles.ts`](./apps/api/src/common/constants/roles.ts)
>
> **Catatan:** Prisma schema masih menggunakan enum lama (`TRAINEE, ASSOCIATE, TRAINER, SOLDAT, ADMIN, OWNER`) karena belum diupdate bersamaan dengan migrasi data. Role di Firestore menggunakan string langsung.

---

## Format Member ID

Pola: `NG` + `[kode generasi+batch]` + `[nomor urut]` + `[suffix pilar]`

| Suffix | Pilar |
|---|---|
| `PG` | Game Logic |
| `GD` | Game Design |
| `SF` | Game Sound |

Contoh: `NG11020125SF` â†’ GEN 1, nomor urut 125, Game Sound

Total anggota terdaftar: **125 orang** (GEN 1 + GEN 2)

---

## Cara Login

Halaman `/login` memiliki **2 tab** (diperbarui v0.1.5):

1. **Login** — pilih metode:
   - 📧 Email + password Firebase
   - 🎮 Member ID (`NG11020125SF`) + password → backend lookup → Firebase sign in
   - 🔑 Google OAuth (tombol Sign in with Google)
   - 🔐 Forgot password → email reset link (inline, tanpa pindah halaman)
2. **Daftar** — verifikasi Member ID + Kode Akses → buat akun Firebase → profil dibuat otomatis

---

## Setup Lokal

### Prasyarat

- Node.js 20+
- PostgreSQL lokal (database `newgame`) **atau** connection string Neon/Supabase
- File `apps/api/serviceAccountKey.json` (Firebase service account)

### 1. Install Dependencies

```bash
cd apps/api && npm install
cd apps/web && npm install
```

### 2. Konfigurasi Environment

**`apps/api/.env`:**
```env
PORT=3001
FRONTEND_URL=http://localhost:3000

# Firebase (aktif digunakan sebagai data source)
FIREBASE_PROJECT_ID=qr-absensi-unandnewgame
FIREBASE_STORAGE_BUCKET=qr-absensi-unandnewgame.appspot.com
# Atau gunakan file: letakkan serviceAccountKey.json di apps/api/

# PostgreSQL (siap, data belum dimigrasikan)
DATABASE_URL="postgresql://user:pass@localhost:5432/newgame"
DIRECT_URL="postgresql://user:pass@localhost:5432/newgame"

# Cache
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Media
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# AI (opsional)
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
```

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=qr-absensi-unandnewgame.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=qr-absensi-unandnewgame
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Setup Database (opsional â€” jika belum)

```bash
cd apps/api
npx prisma generate        # Generate Prisma Client
npx prisma migrate deploy  # Apply schema ke PostgreSQL
# atau: npx prisma db push  (untuk development cepat)
```

### 4. Jalankan Lokal

```bash
# Terminal 1 â€” API (port 3001)
cd apps/api && npm run dev

# Terminal 2 â€” Web (port 3000)
cd apps/web && npm run dev
```

Buka: `http://localhost:3000/landing`

---

## Struktur Proyek

```
web-ua-newgame/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ api/                          # Backend NestJS (Port 3001)
â”‚   â”‚   â”œâ”€â”€ prisma/
â”‚   â”‚   â”‚   â”œâ”€â”€ schema.prisma         # Schema PostgreSQL (synced, belum diisi)
â”‚   â”‚   â”‚   â””â”€â”€ migrations/           # 1 migration: 20260602171817_init
â”‚   â”‚   â”œâ”€â”€ serviceAccountKey.json    # âš ï¸ Firebase credentials (jangan commit)
â”‚   â”‚   â””â”€â”€ src/
â”‚   â”‚       â”œâ”€â”€ firebase/             # FirebaseService â€” data source aktif
â”‚   â”‚       â”œâ”€â”€ database/             # PrismaService â€” siap digunakan
â”‚   â”‚       â”œâ”€â”€ auth/                 # Better Auth config (placeholder)
â”‚   â”‚       â”œâ”€â”€ common/
â”‚   â”‚       â”‚   â”œâ”€â”€ constants/
â”‚   â”‚       â”‚   â”‚   â””â”€â”€ roles.ts      # Role system (8 level, source of truth)
â”‚   â”‚       â”‚   â”œâ”€â”€ guards/           # Firebase, Roles, RateLimit
â”‚   â”‚       â”‚   â”œâ”€â”€ decorators/
â”‚   â”‚       â”‚   â”œâ”€â”€ filters/
â”‚   â”‚       â”‚   â””â”€â”€ interceptors/
â”‚   â”‚       â””â”€â”€ modules/              # 21 modul bisnis
â”‚   â”‚           â”œâ”€â”€ auth/             # + lookup-id endpoint (v0.1.3)
â”‚   â”‚           â”œâ”€â”€ attendance/       # + idempotent endpoint (v0.1.3)
â”‚   â”‚           â””â”€â”€ ...
â”‚   â”‚
â”‚   â””â”€â”€ web/                          # Frontend Next.js (Port 3000)
â”‚       â”œâ”€â”€ public/
â”‚       â”‚   â”œâ”€â”€ logo.png              # Favicon / PWA icon
â”‚       â”‚   â”œâ”€â”€ manifest.json         # PWA manifest
â”‚       â”‚   â”œâ”€â”€ images/
â”‚       â”‚   â”‚   â”œâ”€â”€ logo.svg          # Logo sidebar
â”‚       â”‚   â”‚   â””â”€â”€ characters/       # OC SVG: oc-cmd, oc-gold, oc-hero, oc-read, yua
â”‚       â”‚   â””â”€â”€ assets/sfx/
â”‚       â”‚       â””â”€â”€ yua-select.mp3    # SFX klik Yua
â”‚       â””â”€â”€ src/
â”‚           â”œâ”€â”€ app/
â”‚           â”‚   â”œâ”€â”€ login/            # 3-tab: Email / Member ID / Daftar (v0.1.3)
â”‚           â”‚   â”œâ”€â”€ landing/
â”‚           â”‚   â””â”€â”€ (dashboard)/
â”‚           â”‚       â””â”€â”€ scan/         # + offline sync (v0.1.3)
â”‚           â”œâ”€â”€ components/
â”‚           â”‚   â”œâ”€â”€ layout/
â”‚           â”‚   â”‚   â””â”€â”€ Sidebar.tsx   # NAV_ITEMS â€” Pirate Map bisa dikustomisasi
â”‚           â”‚   â””â”€â”€ ui/
â”‚           â”‚       â”œâ”€â”€ Toast.tsx     # + showError() (v0.1.3)
â”‚           â”‚       â””â”€â”€ ErrorBanner.tsx # (BARU v0.1.3)
â”‚           â””â”€â”€ lib/
â”‚               â”œâ”€â”€ api.ts            # + ApiError (v0.1.3)
â”‚               â”œâ”€â”€ errors.ts         # Error mapping Indonesia (BARU v0.1.3)
â”‚               â””â”€â”€ attendance-sync.ts # Offline QR sync (BARU v0.1.3)
â”‚
â”œâ”€â”€ storage/                          # Aset master beresolusi tinggi
â”‚   â”œâ”€â”€ characters/                   # Karakter OC PNG + SVG
â”‚   â”œâ”€â”€ logo/                         # Variasi logo branding
â”‚   â”œâ”€â”€ sfx/                          # Audio source
â”‚   â””â”€â”€ README.md
â”‚
â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ backup.mjs                    # Backup PostgreSQL (BARU v0.1.3)
â”‚   â”œâ”€â”€ migrate-firestore.mjs         # Migrasi Firestoreâ†’PostgreSQL (BARU v0.1.3)
â”‚   â”œâ”€â”€ audit.mjs
â”‚   â””â”€â”€ find-dupes.mjs
â”‚
â”œâ”€â”€ .github/
â”‚   â””â”€â”€ workflows/
â”‚       â”œâ”€â”€ ci.yml                    # Typecheck, lint, security audit
â”‚       â””â”€â”€ backup.yml                # Backup harian 02:00 WIB (BARU v0.1.3)
â”‚
â”œâ”€â”€ README.md
â”œâ”€â”€ CHANGELOG.md
â”œâ”€â”€ DEVELOPER_GUIDE.md
â”œâ”€â”€ SECURITY.md
â”œâ”€â”€ MIGRATION.md                      # Panduan Firestoreâ†’PostgreSQL (BARU v0.1.3)
â”œâ”€â”€ MEMBER_REGISTRATION.md
â”œâ”€â”€ MEMBER_CREDENTIALS.md             # âš ï¸ RAHASIA â€” jangan commit
â””â”€â”€ TODO.md
```

---

## Backup & Restore

### Setup GitHub Actions Backup

Tambahkan `DATABASE_URL` sebagai **Repository Secret** di:
`GitHub â†’ Settings â†’ Secrets and variables â†’ Actions`

Setelah itu, backup otomatis berjalan setiap hari jam **02:00 WIB** via `.github/workflows/backup.yml`.

### Backup Manual

```bash
node scripts/backup.mjs
# Output: backups/backup-YYYY-MM-DD-HH.sql
```

### Restore

```bash
psql $DATABASE_URL < backups/backup-YYYY-MM-DD-HH.sql
```

---

## Migrasi Firestore â†’ PostgreSQL

> **Status: BELUM DILAKUKAN** â€” Firebase masih menjadi sumber data utama.

```bash
# 1. Preview data yang akan dimigrasikan (aman, tidak ada write)
node scripts/migrate-firestore.mjs --dry-run

# 2. Migrasi satu collection saja
node scripts/migrate-firestore.mjs --collection users --dry-run

# 3. Jalankan migrasi penuh
node scripts/migrate-firestore.mjs
```

**Urutan migrasi yang aman:**
1. Backup Firestore (screenshot jumlah dokumen tiap collection)
2. Dry-run script migrasi
3. Verifikasi jumlah data
4. Jalankan migrasi aktual
5. Update service layer dari `FirebaseService` ke `PrismaService`
6. Testing end-to-end

Panduan lengkap: [MIGRATION.md](./MIGRATION.md)

---

## Pending Actions (Wajib Sebelum Migrasi)

| Item | Perintah / Cara |
|---|---|
| Seed anggota ke Firestore (jika belum) | `node apps/api/src/scripts/seed-members.js` |
| Distribute MEMBER_CREDENTIALS ke anggota | Bagikan secara personal |
| Validasi Cloudinary credentials di `.env` | Coba upload foto profil |
| Tambah Google OAuth URI di Google Console | Tambah `https://unandnewgame-tan.vercel.app/api/auth/callback/google` |
| Aktifkan backup otomatis | Tambah `DATABASE_URL` sebagai GitHub Repository Secret |
| Update role di Firestore ke nama baru | `superadmin` â†’ `code commander`, `presiden` â†’ `pixel presiden` |

---

## Dokumen Pendukung

| Dokumen | Deskripsi |
|---|---|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Standar kode, Git workflow, pola dual-write |
| [SECURITY.md](./SECURITY.md) | Arsitektur keamanan berlapis, rate limiting |
| [MIGRATION.md](./MIGRATION.md) | Panduan cutover Firestore â†’ PostgreSQL |
| [MEMBER_REGISTRATION.md](./MEMBER_REGISTRATION.md) | Panduan admin untuk tambah & kelola anggota |
| [MEMBER_CREDENTIALS.md](./MEMBER_CREDENTIALS.md) | âš ï¸ RAHASIA â€” 125 anggota + kode akses |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat lengkap pembaruan platform |
| [TODO.md](./TODO.md) | Backlog fitur dan perbaikan |

---

## CI/CD

| Trigger | Workflow | Isi |
|---|---|---|
| Push ke `main` | `ci.yml` | TypeScript typecheck Â· npm audit Â· ESLint |
| Cron 19:00 UTC | `backup.yml` | pg_dump â†’ artifact (retensi 30 hari) |
| Manual dispatch | `backup.yml` | Backup on-demand |

---

MIT License â€” 2026 NEWGAME, UKM Game Development Universitas Andalas