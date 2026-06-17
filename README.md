<div align="center">

<img src="apps/web/public/logo.png" alt="NEWGAME Logo" width="96" />

# ✦ NEWGAME Platform

**Platform terpadu UKM Game Development — Universitas Andalas**

*Learn · Create · Play*

---

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.6-7c3aed?style=for-the-badge&logo=shield)](https://better-auth.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Flutter](https://img.shields.io/badge/Flutter-Simulator-02569B?style=for-the-badge&logo=flutter)](tools/mobile-simulator)
[![Vercel](https://img.shields.io/badge/Live%20Demo-unandnewgame.vercel.app-000000?style=for-the-badge&logo=vercel)](https://unandnewgame-tan.vercel.app)

[![Version](https://img.shields.io/badge/Versi-0.2.0-6366f1?style=flat-square)](CHANGELOG.md)
[![Members](https://img.shields.io/badge/Anggota-124%20orang-22c55e?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-fdcf41?style=flat-square)](LICENSE)

</div>

---

## ✦ Apa itu NEWGAME?

NEWGAME adalah platform web internal untuk mengelola seluruh ekosistem UKM Game Development Universitas Andalas. Dari presensi QR hingga leaderboard XP, dari manajemen event hingga koleksi badge — semuanya dalam satu platform.

> **125 anggota aktif** dari dua generasi, tiga pilar (Game Logic, Game Design, Game Sound), dikelola dalam satu sistem terpadu.

---

## ✦ Fitur Utama

<table>
<tr>
<td width="50%">

**🎮 Gamifikasi & Progres**
- Sistem XP dengan level, streak, dan seasonal reset
- Leaderboard real-time (Redis cache, filter gen & pilar)
- Koleksi badge dengan rarity & progress bar
- Bonus streak 4 tier + penalti keterlambatan
- Activity Heatmap (GitHub-style)

**📱 Presensi Digital**
- QR scan idempotent (satu scan = satu absen)
- Antrian offline — sync otomatis saat koneksi pulih
- Input manual kehadiran oleh admin
- Penalti telat otomatis (-2 XP / 15 menit)

**📅 Event & Kalender**
- Kalender bulan dengan titik event berwarna
- Recurring event (weekly / biweekly / monthly)
- Reminder email otomatis + notifikasi web

</td>
<td width="50%">

**👤 Member & Profil**
- Direktori anggota — search, card grid, profil klik-through
- Edit bio, skills, GitHub, LinkedIn, avatar
- Download profile card sebagai PNG
- Format Member ID unik: `NG11020125SF`

**📰 Konten & Berita**
- Artikel & tutorial per pilar (Logic / Design / Sound)
- YouTube embed, pencarian dengan debounce
- NewsSlider di dashboard

**🔐 Keamanan & Akses**
- 8 level role — NPC hingga Pixel Presiden
- Login via email, Member ID, atau Google OAuth
- 2FA TOTP (RFC 6238), forgot password inline
- Rate limiting (Upstash Redis + memory fallback)
- Anomaly detection + SIEM panel admin

</td>
</tr>
</table>

---

## ✦ Struktur Proyek

```
web-ua-newgame/
│
├── apps/
│   ├── api/                   ← NestJS REST API (port 3001)
│   │   ├── src/modules/       ← 21 modul bisnis
│   │   │   ├── auth/          ← Firebase, OAuth, 2FA TOTP
│   │   │   ├── members/       ← CRUD, bulk import CSV/JSON
│   │   │   ├── attendance/    ← QR scan, kehadiran, penalti
│   │   │   ├── events/        ← Recurring, reminder
│   │   │   ├── xp/            ← Level, streak, seasonal reset
│   │   │   ├── leaderboard/   ← Redis cache TTL 60s
│   │   │   ├── badges/        ← Award manual & otomatis
│   │   │   ├── news/          ← Artikel, tutorial, embed
│   │   │   ├── media/         ← Cloudinary upload
│   │   │   ├── admin/         ← Panel admin + SIEM
│   │   │   └── ...
│   │   └── prisma/            ← Schema PostgreSQL (Neon) — production aktif
│   │       ├── schema.prisma  ← User, Member, Session, Account, Verification
│   │       └── seed.ts        ← Seed 124 anggota + kredensial awal
│   │
│   └── web/                   ← Next.js 14 Frontend (port 3000)
│       └── src/
│           ├── app/
│           │   ├── landing/          ← Landing page + animasi
│           │   ├── login/            ← 2-tab auth (Login + Daftar)
│           │   └── (dashboard)/
│           │       ├── dashboard/    ← XP wave, stat cards, event
│           │       ├── leaderboard/  ← Filter gen & pilar, export CSV
│           │       ├── members/      ← Direktori + profil anggota
│           │       ├── calendar/     ← Kalender event berwarna
│           │       ├── badges/       ← Koleksi badge + modal detail
│           │       ├── scan/         ← QR scanner + antrian offline
│           │       ├── logs/         ← Activity log + filter + export
│           │       ├── news/         ← Artikel & pencarian
│           │       ├── profile/      ← Edit profil + download card
│           │       ├── pirate-map/   ← Pirate Map Framer Motion
│           │       └── admin/        ← Panel admin lengkap + SIEM
│           ├── components/
│           │   ├── ui/               ← Design system components
│           │   └── layout/           ← Sidebar, navbar, shell
│           └── lib/
│               ├── api.ts            ← HTTP client + error handling
│               ├── auth-client.ts    ← Better Auth client (createAuthClient)
│               ├── auth-store.ts     ← Zustand auth state (Better Auth session)
│               └── attendance-sync.ts← Offline queue sync
│
├── tools/
│   └── mobile-simulator/      ← Flutter app — preview web di HP/emulator
│
├── scripts/                   ← backup.mjs, migrate-firestore.mjs
└── .github/workflows/         ← CI (typecheck, audit), Backup cron
```

---

## ✦ Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | App Router, RSC, dynamic imports |
| Styling | Vanilla CSS (globals.css) | Design system custom, dark mode |
| State | Zustand | Auth store, UI state |
| Animation | Framer Motion | Hero, PirateMap, card transitions |
| Backend | NestJS 10 | Modular, Guard, Interceptor |
| **Auth** | **Better Auth 1.6** | **Email/password + Google OAuth + session cookie** |
| **Database** | **PostgreSQL + Prisma (Neon)** | **Production aktif** — members, users, sessions |
| Database Legacy | Firebase Firestore | Data lama — migrasi bertahap (Fase 2/3) |
| Cache | Upstash Redis | Leaderboard TTL 60s, rate limiting |
| Storage | Cloudinary | Gambar + video hingga 100MB |
| Email | Resend / Nodemailer | Reset password, notifikasi (perlu dikonfigurasi) |
| Realtime | Socket.io | WebSocket (butuh server persistent) |
| Analytics | PostHog | Page views, event tracking |
| Hosting | Vercel | Frontend + API serverless |
| Simulator | Flutter | Android emulator + Windows frame |

---

## ✦ Sistem Role

```
Pixel Presiden  (7) ━━━━━━━━━━━━━━━━  Akses penuh
Code Commander  (6) ━━━━━━━━━━━━━━    Kelola role + buat admin
Gold Guardian   (5) ━━━━━━━━━━━━      Manajemen keuangan
Quest Keeper    (4) ━━━━━━━━━━━       Ekspor data + laporan
Admin           (3) ━━━━━━━━━         Kelola member, event, berita
Inventori       (2) ━━━━━━            Manajemen inventori
Member          (1) ━━━━              Dashboard, presensi, profil
NPC             (0) ━━               Akses publik — belum terverifikasi
```

---

## ✦ Format Member ID

```
NG  +  [Gen+Batch]  +  [Nomor Urut]  +  [Pilar]

Contoh:  NG 1 1 020 125 SF
              │ │  │   │  └── SF = Game Sound
              │ │  │   └───── nomor urut: 125
              │ │  └───────── 020 = kode batch
              │ └──────────── 1 = GEN 1
              └────────────── NG = NEWGAME
```

| Suffix | Pilar |
|---|---|
| `PG` | Game Logic |
| `GD` | Game Design |
| `SF` | Game Sound |

---

## ✦ Cara Login

```
/login memiliki dua tab:

  [ LOGIN ]                              [ DAFTAR ]
  ──────────────────────────────────     ──────────────────────────────
  Toggle: Email | Member ID              1. Masukkan Member ID
                                         2. Masukkan Kode Akses (dari admin)
  Via Email:                             3. Isi email + password baru
    → ketik email + password             4. Akun dibuat → langsung bisa login
    → authClient.signIn.email()

  Via Member ID (NG11020125SF):          ⚠️ Tidak perlu verifikasi email.
    → lookup email di PostgreSQL          Langsung aktif setelah daftar.
    → sign in dengan email yang di-resolve

  Via Google:
    → authClient.signIn.social('google')
    → OAuth Google callback

  Lupa Password:
    → POST /api/auth/forget-password
    → email reset dikirim (butuh email provider)
    → halaman /reset-password
```

---

## ✦ Setup Lokal

### Prasyarat

- Node.js 20+
- `apps/api/serviceAccountKey.json` (Firebase service account)
- PostgreSQL lokal / Neon / Supabase (opsional)

### Install

```bash
# API
cd apps/api && npm install

# Web
cd apps/web && npm install
```

### Environment — `apps/api/.env`

```env
PORT=3001
FRONTEND_URL=http://localhost:3000

# Better Auth (wajib)
BETTER_AUTH_SECRET=<32+ char random string>   # generate: openssl rand -hex 32
BETTER_AUTH_URL=http://localhost:3001

# Google OAuth (untuk login Google)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@neon.tech/newgame?sslmode=require
DIRECT_URL=postgresql://postgres:pass@localhost:5432/newgame  # dev only

# Cache
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Legacy Firebase (masih dipakai service lain)
FIREBASE_PROJECT_ID=qr-absensi-unandnewgame
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json

# AI (opsional)
OPENAI_API_KEY=sk-...
ZILLIZ_URI=...
```

### Environment — `apps/web/.env.local`

```env
# API URL — harus menunjuk ke NestJS API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Opsional (jika masih pakai Firebase di beberapa halaman)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=qr-absensi-unandnewgame.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=qr-absensi-unandnewgame
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Jalankan

```bash
# Terminal 1 — API
cd apps/api && npm run dev

# Terminal 2 — Web
cd apps/web && npm run dev

# Buka browser
http://localhost:3000/landing
```

```bash
# Docker (eksperimental)
docker compose up --build
```

---

## ✦ Mobile Simulator (Flutter)

Preview tampilan web NEWGAME di dalam emulator Android dari desktop:

```bash
cd tools/mobile-simulator

# Jalankan emulator dulu (Android Studio → Device Manager)
# Lalu:
flutter run -d emulator-5554

# Atau pakai script otomatis:
.\run_simulator.ps1
```

Lihat panduan lengkap di [`tools/mobile-simulator/README.md`](tools/mobile-simulator/README.md).

---

## ✦ Infrastruktur

| Layanan | Status | Keterangan |
|---|---|---|
| **Better Auth** | **✅ Aktif (v0.2.0)** | **Auth utama: email, Google OAuth, session cookie** |
| **PostgreSQL (Neon)** | **✅ Aktif** | **Members (124) + Users + Sessions + Accounts** |
| Firebase Firestore | ⚠️ Migrasi | Data lama — bertahap pindah ke PostgreSQL |
| Firebase Auth | ⚠️ Deprecated | Diganti Better Auth — masih aktif untuk service lama |
| Upstash Redis | ✅ Aktif | Cache leaderboard + rate limiting |
| Vercel | ✅ Aktif | Hosting frontend + serverless |
| PostHog | ✅ Aktif | Analytics penggunaan |
| Cloudinary | ⚙️ Perlu env | Upload gambar/video |
| Google OAuth | ⚙️ Perlu setup | Tambah redirect URI + isi GOOGLE_CLIENT_ID/SECRET |
| Email Provider | ⚙️ Perlu setup | Reset password butuh Resend/SMTP |
| Docker | 🔧 Parsial | Dockerfile ada, belum diuji penuh |
| WebSocket | 🔧 Parsial | Butuh server persistent (bukan Vercel) |
| OpenAI / Zilliz | 🔜 Opsional | Semantic search (belum aktif) |

---

## ✦ CI/CD

```
Push ke main ──→ ci.yml ──→ TypeScript check + npm audit + ESLint
Cron 19.00 UTC ─→ backup.yml ──→ pg_dump → artifact (retensi 30 hari)
Manual dispatch ─→ backup.yml ──→ backup on-demand
```

---

## ✦ Dokumen Pendukung

| Dokumen | Isi |
|---|---|
| [`CHANGELOG.md`](CHANGELOG.md) | Riwayat perubahan — dari awal sampai sekarang |
| [`TODO.md`](TODO.md) | Fitur & perbaikan yang belum selesai |
| [`MANUAL_TASKS.md`](MANUAL_TASKS.md) | Tugas wajib manual (credential, cloud, infra) |
| [`EXTERNAL_SERVICES.md`](EXTERNAL_SERVICES.md) | Semua layanan eksternal, fungsi, env, status |
| [`DEPLOYMENT_RUNBOOK.md`](DEPLOYMENT_RUNBOOK.md) | Panduan deploy ke production |
| [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md) | Standar kode dan Git workflow |
| [`SECURITY.md`](SECURITY.md) | Arsitektur keamanan platform |
| [`MIGRATION.md`](MIGRATION.md) | Panduan cutover Firestore → PostgreSQL |
| [`DESIGN.md`](DESIGN.md) | Arsitektur dan design system |

---

<div align="center">

**NEWGAME — UKM Game Development, Universitas Andalas**

*v0.2.0 · Better Auth + PostgreSQL + Next.js + NestJS · 124 anggota*

[![Live](https://img.shields.io/badge/🌐%20Buka%20Platform-unandnewgame--tan.vercel.app-6366f1?style=for-the-badge)](https://unandnewgame-tan.vercel.app)

MIT License © 2026 NEWGAME

</div>