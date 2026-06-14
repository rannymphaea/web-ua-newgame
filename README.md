<div align="center">
  <img src="apps/web/public/logo.png" alt="NEWGAME" width="72" />

  <h1>NEWGAME v0.1.5</h1>
  <p>Platform Web UKM Game Development — Universitas Andalas</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Firebase-Aktif-orange?logo=firebase" alt="Firebase" />
    <img src="https://img.shields.io/badge/PostgreSQL-Direncanakan-336791?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Versi-0.1.5-6366f1" alt="Versi" />
    <a href="https://unandnewgame-tan.vercel.app"><img src="https://img.shields.io/badge/Live-unandnewgame--tan.vercel.app-black?logo=vercel" alt="Live" /></a>
  </p>
</div>

---

## Ringkasan

NEWGAME adalah platform web terpadu UKM Game Development Universitas Andalas. Dibangun sebagai monorepo dengan dua aplikasi utama:

- **Backend:** NestJS REST API (port 3001) — 21 modul bisnis
- **Frontend:** Next.js 14 App Router (port 3000) — dark mode, PWA, realtime

**Anggota terdaftar:** 125 orang (GEN 1 + GEN 2)
**Firebase Project:** `qr-absensi-unandnewgame`
**Deploy:** Vercel — https://unandnewgame-tan.vercel.app

---

## Status Infrastruktur (Juni 2026)

| Komponen | Status | Keterangan |
|---|---|---|
| **Firebase Firestore** | ✅ Aktif | Sumber data utama production |
| **Firebase Auth** | ✅ Aktif | Autentikasi semua anggota |
| **Upstash Redis** | ✅ Aktif | Rate limiting + leaderboard cache TTL 60s |
| **Cloudinary** | ⚙️ Butuh env | Upload gambar/video — perlu credential valid |
| **Vercel** | ✅ Deployed | Frontend + API serverless |
| **PostgreSQL** | 🔜 Direncanakan | Schema ada (Prisma), migrasi data belum — lihat MIGRATION.md |
| **Docker** | 🔜 Direncanakan | Compose file ada, belum fully tested — lihat TODO.md |
| **Flutter (mobile)** | 🔜 Parsial | Embedded di `tools/mobile-simulator`, belum production-ready |
| **WebSocket (socket.io)** | ✅ Implemented | NotificationsGateway — butuh server persistent (bukan Vercel serverless) |
| **SMTP Email** | ⚙️ Butuh env | Nodemailer — perlu SMTP_HOST/USER/PASS |

> **Catatan PostgreSQL:** Firestore adalah sumber data aktif. PostgreSQL + Prisma sudah disiapkan dan schema sudah ada, tapi data belum dipindahkan. Migrasi dijadwalkan setelah platform stabil. Lihat [MIGRATION.md](./MIGRATION.md).

> **Catatan Docker:** `docker-compose.yml` dan Dockerfile API/Web sudah ada, tapi belum diuji end-to-end di semua OS. Lihat [TODO.md](./TODO.md) untuk detail.

---

## Fitur Utama

### Backend API (NestJS)
- **Auth** — Firebase, login via Member ID, Google OAuth, 2FA TOTP (RFC 6238)
- **Members** — CRUD, bulk import CSV/JSON, search, generasi filter, export CSV
- **Attendance** — QR scan idempotent, manual input, late penalty (-2 XP/15min), export CSV
- **Events** — recurring (weekly/biweekly/monthly), reminder email + notif
- **XP** — level computation, leaderboard Redis cache, season reset, streak bonus
- **Notifications** — WebSocket real-time (socket.io), Nodemailer email, Firestore persist
- **Media** — Cloudinary upload (gambar + video 100MB), pagination, metadata
- **News** — artikel, tutorial per pilar, YouTube embed, search
- **Badges** — definisi + award manual/otomatis via `checkAndAward()`
- **AI** — koneksi Milvus/Zilliz vector DB + OpenAI embedding (semantic search, parsial)
- **Security** — RateLimit (Upstash + fallback memory), Helmet, CORS, anomaly detection

### Frontend (Next.js 14)
- **Landing page** — HeroTypewriter, PirateMap animasi Framer Motion
- **Auth** — 2-tab login (Login + Daftar), forgot password inline, 2FA TOTP
- **Dashboard** — XP wave bar, stat cards, event upcoming, quick actions
- **Leaderboard** — generasi filter (GEN 1/2), pilar filter, top-3 trophy
- **Calendar** — month grid event dots, sidebar detail, color legend
- **Members** — directory search, card grid, click-through profile detail
- **News** — artikel search, list dengan cover, reader
- **Profile** — edit bio/skills/links, avatar selection, download profile card PNG
- **Badges** — grid koleksi, detail modal rarity (rarity glow + progress bar)
- **Logs** — filter tipe + date range, export CSV
- **Admin** — member management, event creation, news CRUD, media gallery, SIEM viewer
- **Scan** — QR scanner, offline queue (sync-on-reconnect)
- **UI System** — dark mode, GlobalSearch Cmd+K, Toast queue, keyboard shortcuts, heatmap

---

## Struktur Proyek

```
web-ua-newgame/
├── apps/
│   ├── api/                          # Backend NestJS (Port 3001)
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Schema PostgreSQL (ada, belum dipakai di prod)
│   │   │   └── migrations/           # 1 migration: 20260602171817_init
│   │   ├── Dockerfile                # Docker image API
│   │   └── src/
│   │       ├── firebase/             # FirebaseService — data source aktif
│   │       ├── database/             # PrismaService — siap, belum dipakai di prod
│   │       ├── common/
│   │       │   ├── constants/roles.ts # Role system 8 level
│   │       │   ├── guards/           # FirebaseAuth, Roles, RateLimit
│   │       │   ├── decorators/
│   │       │   ├── filters/          # AllExceptionsFilter
│   │       │   └── interceptors/     # ResponseInterceptor
│   │       ├── modules/              # 21 modul bisnis
│   │       │   ├── auth/             # login, register, 2FA, OAuth
│   │       │   ├── members/          # CRUD, bulk import, search
│   │       │   ├── attendance/       # QR scan, manual, export
│   │       │   ├── events/           # CRUD, recurring, reminder
│   │       │   ├── xp/               # level, leaderboard, streak, export CSV
│   │       │   ├── notifications/    # WebSocket gateway + email + Firestore
│   │       │   ├── media/            # Cloudinary upload gambar + video
│   │       │   ├── news/             # artikel, tutorial, YouTube
│   │       │   ├── badges/           # definisi + award + auto-check
│   │       │   ├── ai/               # Milvus, OpenAI embedding
│   │       │   ├── logs/             # activity log forensic
│   │       │   ├── dashboard/        # agregat dashboard stats
│   │       │   ├── anomalies/        # anomaly detection
│   │       │   ├── cyber-defense/    # security module
│   │       │   ├── export/           # CSV export helpers
│   │       │   ├── import/           # bulk import helpers
│   │       │   ├── leave/            # izin tidak hadir
│   │       │   ├── pillar-levels/    # XP per pilar
│   │       │   ├── user-history/     # timeline anggota
│   │       │   └── user-vault/       # data sensitif
│   │       └── scripts/
│   │           ├── seed-members.js   # Seed 125 anggota ke Firestore
│   │           ├── add-member.js     # CLI tambah satu anggota
│   │           └── generate-api-collection.ts # Postman/Insomnia JSON
│   │
│   └── web/                          # Frontend Next.js (Port 3000)
│       ├── Dockerfile                # Docker image Web
│       ├── public/
│       │   ├── logo.png              # Favicon / PWA icon
│       │   ├── manifest.json         # PWA manifest
│       │   ├── images/characters/    # OC SVG: oc-cmd, oc-gold, oc-hero, oc-read, yua
│       │   └── assets/sfx/yua-select.mp3
│       └── src/
│           ├── app/
│           │   ├── login/            # Auth: 2-tab (Login + Daftar)
│           │   ├── landing/          # Landing page publik
│           │   └── (dashboard)/
│           │       ├── dashboard/    # Halaman utama member
│           │       ├── leaderboard/  # Top XP + filter
│           │       ├── calendar/     # Event calendar
│           │       ├── members/      # Directory + [uid] profile
│           │       ├── news/         # Artikel + search
│           │       ├── profile/      # Edit profil + download card
│           │       ├── badges/       # Koleksi badge
│           │       ├── logs/         # Activity log + export
│           │       ├── scan/         # QR scanner
│           │       ├── admin/        # Panel admin
│           │       └── dev-tools/    # Mobile simulator
│           ├── components/
│           │   ├── layout/Sidebar.tsx
│           │   ├── ui/
│           │   │   ├── Toast.tsx
│           │   │   ├── AnnouncementBanner.tsx  # Emergency broadcast
│           │   │   ├── GlobalSearch.tsx        # Cmd+K search
│           │   │   └── NovelCursor.tsx
│           │   ├── badges/BadgeDetailModal.tsx  # Rarity modal
│           │   └── profile/ActivityHeatmap.tsx  # GitHub-style heatmap
│           └── lib/
│               ├── api.ts            # HTTP client
│               ├── errors.ts         # Error mapping Indonesia
│               └── attendance-sync.ts # Offline QR sync
│
├── tools/
│   └── mobile-simulator/             # Flutter Android app (parsial, belum production)
│
├── storage/                          # Aset master beresolusi tinggi
│   ├── characters/                   # Karakter OC PNG + SVG
│   ├── logo/                         # Variasi logo branding
│   └── sfx/                          # Audio source
│
├── scripts/
│   ├── backup.mjs                    # Backup PostgreSQL manual
│   ├── migrate-firestore.mjs         # Migrasi Firestore → PostgreSQL
│   ├── audit.mjs
│   └── find-dupes.mjs
│
├── .github/workflows/
│   ├── ci.yml                        # TypeCheck + audit + lint
│   └── backup.yml                    # Backup harian 02:00 WIB
│
├── docker-compose.yml                # Local dev: API + Web + Redis (butuh testing)
│
├── README.md                         # (file ini)
├── CHANGELOG.md                      # Riwayat perubahan per versi
├── TODO.md                           # Backlog fitur pending
├── MANUAL_TASKS.md                   # Tugas wajib manual (credential, cloud console)
├── DEPLOYMENT_RUNBOOK.md             # Panduan deploy ke production
├── DEVELOPER_GUIDE.md                # Standar kode, Git workflow
├── SECURITY.md                       # Arsitektur keamanan
├── MIGRATION.md                      # Panduan Firestore → PostgreSQL
├── DESIGN.md                         # Arsitektur platform + design system
├── MEMBER_REGISTRATION.md            # Panduan admin kelola anggota
└── MEMBER_CREDENTIALS.md             # ⚠️ RAHASIA — jangan commit ke public repo
```

---

## Format Member ID

Pola: `NG` + `[kode gen+batch]` + `[nomor urut]` + `[suffix pilar]`

| Suffix | Pilar |
|---|---|
| `PG` | Game Logic |
| `GD` | Game Design |
| `SF` | Game Sound |

Contoh: `NG11020125SF` → GEN 1, nomor 125, Game Sound

---

## Sistem Role

| Role | Level | Akses |
|---|---|---|
| `npc` | 0 | Publik saja, belum diverifikasi |
| `member` | 1 | Dashboard, presensi, profil |
| `inventori` | 2 | + Manajemen inventori |
| `admin` | 3 | + Kelola member, event, berita |
| `quest keeper` | 4 | + Ekspor data, laporan |
| `gold guardian` | 5 | + Manajemen keuangan |
| `code commander` | 6 | + Kelola role, buat admin |
| `pixel presiden` | 7 | Akses penuh |

---

## Cara Login

Halaman `/login` memiliki **2 tab:**

1. **Login** — pilih metode:
   - 📧 Email + password Firebase
   - 🎮 Member ID + password → backend lookup → Firebase sign in
   - 🔑 Google OAuth
   - 🔐 Forgot password → email reset inline
2. **Daftar** — verifikasi Member ID + Kode Akses → buat akun Firebase

---

## Setup Lokal

### Prasyarat
- Node.js 20+
- Firebase service account (`apps/api/serviceAccountKey.json`)
- (Opsional) PostgreSQL lokal atau Neon/Supabase URL

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

# Firebase
FIREBASE_PROJECT_ID=qr-absensi-unandnewgame
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# PostgreSQL (opsional untuk dev)
DATABASE_URL="postgresql://user:pass@localhost:5432/newgame"

# Redis
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="NEWGAME <your-email@gmail.com>"

# AI (opsional)
OPENAI_API_KEY=sk-...
ZILLIZ_URI=https://...
ZILLIZ_TOKEN=...
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
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Jalankan Lokal

```bash
# Terminal 1 — API
cd apps/api && npm run dev

# Terminal 2 — Web
cd apps/web && npm run dev
```

Buka: `http://localhost:3000/landing`

### 4. Jalankan via Docker (Eksperimental)

> ⚠️ Belum fully tested. Lihat [TODO.md](./TODO.md) untuk status.

```bash
# Pastikan Docker Desktop berjalan
docker compose up --build

# API: http://localhost:3001
# Web: http://localhost:3000
# Redis: localhost:6379
```

---

## Rencana Migrasi PostgreSQL

> **Status saat ini:** Firebase Firestore = sumber data aktif.
> PostgreSQL + Prisma sudah disiapkan dan schema ada (`prisma/schema.prisma`).
> Migrasi data dijadwalkan setelah platform stabil di production.

**Langkah migrasi (butuh dilakukan manual):**
```bash
# 1. Dry-run — tidak ada write
node scripts/migrate-firestore.mjs --dry-run

# 2. Migrasi satu collection
node scripts/migrate-firestore.mjs --collection users --dry-run

# 3. Jalankan migrasi penuh
node scripts/migrate-firestore.mjs
```

Lihat panduan lengkap: [MIGRATION.md](./MIGRATION.md)

---

## Backup & Restore

```bash
# Backup manual
node scripts/backup.mjs
# Output: backups/backup-YYYY-MM-DD-HH.sql

# Restore
psql $DATABASE_URL < backups/backup-YYYY-MM-DD-HH.sql
```

Backup otomatis berjalan setiap hari **02:00 WIB** via GitHub Actions (butuh secret `DATABASE_URL`).

---

## Dokumen Pendukung

| Dokumen | Deskripsi |
|---|---|
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat lengkap perubahan per versi |
| [TODO.md](./TODO.md) | Backlog fitur pending |
| [MANUAL_TASKS.md](./MANUAL_TASKS.md) | Tugas wajib manual (credential, cloud, infra) |
| [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md) | Panduan deploy production lengkap |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Standar kode + Git workflow |
| [SECURITY.md](./SECURITY.md) | Arsitektur keamanan berlapis |
| [MIGRATION.md](./MIGRATION.md) | Panduan cutover Firestore → PostgreSQL |
| [DESIGN.md](./DESIGN.md) | Arsitektur + design system platform |
| [MEMBER_REGISTRATION.md](./MEMBER_REGISTRATION.md) | Panduan admin kelola anggota |
| [MEMBER_CREDENTIALS.md](./MEMBER_CREDENTIALS.md) | ⚠️ RAHASIA — 125 anggota + kode akses |

---

## CI/CD

| Trigger | Workflow | Isi |
|---|---|---|
| Push ke `main` | `ci.yml` | TypeScript typecheck · npm audit · ESLint |
| Cron 19:00 UTC | `backup.yml` | pg_dump → artifact (retensi 30 hari) |
| Manual dispatch | `backup.yml` | Backup on-demand |

---

MIT License — 2026 NEWGAME, UKM Game Development Universitas Andalas