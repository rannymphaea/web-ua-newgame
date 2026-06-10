<div align="center">
  <img src="apps/web/public/logo.png" alt="NEWGAME" width="72" />

  <h1>NEWGAME V1.2</h1>
  <p>Platform Web UKM Game Development — Universitas Andalas</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Firebase-Aktif-orange?logo=firebase" alt="Firebase" />
    <img src="https://img.shields.io/badge/PostgreSQL-Siap_Migrasi-336791?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Versi-1.2-6366f1" alt="Versi" />
    <a href="https://unandnewgame-tan.vercel.app"><img src="https://img.shields.io/badge/Live-unandnewgame--tan.vercel.app-black?logo=vercel" alt="Live" /></a>
  </p>
</div>

---

## Status Arsitektur (Per Juni 2026)

| Komponen | Status | Keterangan |
|---|---|---|
| **Firebase Firestore** | ✅ Aktif | Sumber data utama produksi |
| **Firebase Auth** | ✅ Aktif | Autentikasi login semua anggota |
| **PostgreSQL (local)** | ✅ Schema tersinkron | `npx prisma db push` sudah dijalankan, **data belum dimigrasikan** |
| **Prisma Client** | ✅ Generated | v5.22.0, terhubung ke `newgame` di localhost |
| **Upstash Redis** | ✅ Aktif | Rate limiting & leaderboard cache |
| **Cloudinary** | ✅ Aktif | Upload media |
| **Vercel** | ✅ Deployed | Frontend + API serverless |

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
| `members` | Data administrasi anggota — Member ID, nama, pilar, kode akses |
| `users` | Akun login — email, role, XP, avatar, status |
| `events` | Data event — nama, waktu, XP reward, status aktif |
| `attendance` | Riwayat presensi per anggota per event |
| `tokens` | QR token untuk presensi |
| `logs` | Forensic activity log |
| `media` | Referensi file media (Cloudinary) |
| `user_history` | Timeline aktivitas anggota |
| `user_vault` | Data sensitif anggota |

---

## Struktur Aset

### `storage/` — Aset Master (Sumber)

Direktori ini menyimpan file sumber beresolusi tinggi. **Jangan diimport langsung ke kode Next.js.**

```
storage/
├── characters/      # Karakter OC NEWGAME (PNG + SVG resolusi tinggi)
│   ├── CodeCommandColourOutlined.{png,svg}   # Code Commander OC
│   ├── goldGuardianColourOutlined.{png,svg}  # Gold Guardian OC
│   ├── sekumColourOutlined.{png,svg}          # Quest Keeper OC
│   ├── colourOutlined.{png,svg}               # Karakter umum
│   ├── yua.{png,svg}                          # Maskot Yua
│   └── logo.{png,svg}                         # Logo resolusi tinggi
├── logo/            # Variasi logo untuk branding eksternal
└── sfx/             # Audio source sebelum kompresi
```

### `apps/web/public/` — Aset Web (Deploy)

```
public/
├── logo.png                   # Favicon / PWA icon (19 KB)
├── manifest.json              # PWA manifest
├── images/
│   ├── logo.svg               # Logo untuk sidebar
│   └── characters/            # OC SVG siap web
│       ├── oc-cmd.svg         # Code Commander (dipakai di /scan, /calendar)
│       ├── oc-gold.svg        # Gold Guardian
│       ├── oc-hero.svg        # Hero OC
│       ├── oc-read.svg        # Quest Keeper / Sekum
│       └── yua.svg            # Maskot Yua (dipakai di /dashboard, /profile, /landing)
└── assets/sfx/
    └── yua-select.mp3         # SFX klik karakter Yua
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
// apps/web/src/components/layout/Sidebar.tsx — NAV_ITEMS
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

Contoh: `NG11020125SF` → GEN 1, nomor urut 125, Game Sound

Total anggota terdaftar: **125 orang** (GEN 1 + GEN 2)

---

## Cara Login

Halaman `/login` memiliki **3 tab**:

1. **Email** — email + password Firebase
2. **Member ID** — masukkan `NG11020125SF` + password → backend lookup email → Firebase sign in
3. **Daftar** — verifikasi Member ID + Kode Akses → buat akun Firebase

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

### 3. Setup Database (opsional — jika belum)

```bash
cd apps/api
npx prisma generate        # Generate Prisma Client
npx prisma migrate deploy  # Apply schema ke PostgreSQL
# atau: npx prisma db push  (untuk development cepat)
```

### 4. Jalankan Lokal

```bash
# Terminal 1 — API (port 3001)
cd apps/api && npm run dev

# Terminal 2 — Web (port 3000)
cd apps/web && npm run dev
```

Buka: `http://localhost:3000/landing`

---

## Struktur Proyek

```
web-ua-newgame/
├── apps/
│   ├── api/                          # Backend NestJS (Port 3001)
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Schema PostgreSQL (synced, belum diisi)
│   │   │   └── migrations/           # 1 migration: 20260602171817_init
│   │   ├── serviceAccountKey.json    # ⚠️ Firebase credentials (jangan commit)
│   │   └── src/
│   │       ├── firebase/             # FirebaseService — data source aktif
│   │       ├── database/             # PrismaService — siap digunakan
│   │       ├── auth/                 # Better Auth config (placeholder)
│   │       ├── common/
│   │       │   ├── constants/
│   │       │   │   └── roles.ts      # Role system (8 level, source of truth)
│   │       │   ├── guards/           # Firebase, Roles, RateLimit
│   │       │   ├── decorators/
│   │       │   ├── filters/
│   │       │   └── interceptors/
│   │       └── modules/              # 21 modul bisnis
│   │           ├── auth/             # + lookup-id endpoint (V1.2)
│   │           ├── attendance/       # + idempotent endpoint (V1.2)
│   │           └── ...
│   │
│   └── web/                          # Frontend Next.js (Port 3000)
│       ├── public/
│       │   ├── logo.png              # Favicon / PWA icon
│       │   ├── manifest.json         # PWA manifest
│       │   ├── images/
│       │   │   ├── logo.svg          # Logo sidebar
│       │   │   └── characters/       # OC SVG: oc-cmd, oc-gold, oc-hero, oc-read, yua
│       │   └── assets/sfx/
│       │       └── yua-select.mp3    # SFX klik Yua
│       └── src/
│           ├── app/
│           │   ├── login/            # 3-tab: Email / Member ID / Daftar (V1.2)
│           │   ├── landing/
│           │   └── (dashboard)/
│           │       └── scan/         # + offline sync (V1.2)
│           ├── components/
│           │   ├── layout/
│           │   │   └── Sidebar.tsx   # NAV_ITEMS — Pirate Map bisa dikustomisasi
│           │   └── ui/
│           │       ├── Toast.tsx     # + showError() (V1.2)
│           │       └── ErrorBanner.tsx # (BARU V1.2)
│           └── lib/
│               ├── api.ts            # + ApiError (V1.2)
│               ├── errors.ts         # Error mapping Indonesia (BARU V1.2)
│               └── attendance-sync.ts # Offline QR sync (BARU V1.2)
│
├── storage/                          # Aset master beresolusi tinggi
│   ├── characters/                   # Karakter OC PNG + SVG
│   ├── logo/                         # Variasi logo branding
│   ├── sfx/                          # Audio source
│   └── README.md
│
├── scripts/
│   ├── backup.mjs                    # Backup PostgreSQL (BARU V1.2)
│   ├── migrate-firestore.mjs         # Migrasi Firestore→PostgreSQL (BARU V1.2)
│   ├── audit.mjs
│   └── find-dupes.mjs
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Typecheck, lint, security audit
│       └── backup.yml                # Backup harian 02:00 WIB (BARU V1.2)
│
├── README.md
├── CHANGELOG.md
├── DEVELOPER_GUIDE.md
├── SECURITY.md
├── MIGRATION.md                      # Panduan Firestore→PostgreSQL (BARU V1.2)
├── MEMBER_REGISTRATION.md
├── MEMBER_CREDENTIALS.md             # ⚠️ RAHASIA — jangan commit
└── TODO.md
```

---

## Backup & Restore

### Setup GitHub Actions Backup

Tambahkan `DATABASE_URL` sebagai **Repository Secret** di:
`GitHub → Settings → Secrets and variables → Actions`

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

## Migrasi Firestore → PostgreSQL

> **Status: BELUM DILAKUKAN** — Firebase masih menjadi sumber data utama.

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
| Update role di Firestore ke nama baru | `superadmin` → `code commander`, `presiden` → `pixel presiden` |

---

## Dokumen Pendukung

| Dokumen | Deskripsi |
|---|---|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Standar kode, Git workflow, pola dual-write |
| [SECURITY.md](./SECURITY.md) | Arsitektur keamanan berlapis, rate limiting |
| [MIGRATION.md](./MIGRATION.md) | Panduan cutover Firestore → PostgreSQL |
| [MEMBER_REGISTRATION.md](./MEMBER_REGISTRATION.md) | Panduan admin untuk tambah & kelola anggota |
| [MEMBER_CREDENTIALS.md](./MEMBER_CREDENTIALS.md) | ⚠️ RAHASIA — 125 anggota + kode akses |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat lengkap pembaruan platform |
| [TODO.md](./TODO.md) | Backlog fitur dan perbaikan |

---

## CI/CD

| Trigger | Workflow | Isi |
|---|---|---|
| Push ke `main` | `ci.yml` | TypeScript typecheck · npm audit · ESLint |
| Cron 19:00 UTC | `backup.yml` | pg_dump → artifact (retensi 30 hari) |
| Manual dispatch | `backup.yml` | Backup on-demand |

---

MIT License — 2026 NEWGAME, UKM Game Development Universitas Andalas