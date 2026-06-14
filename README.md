<div align="center">
  <img src="apps/web/public/logo.png" alt="NEWGAME" width="72" />
  <h3>NEWGAME v0.1.5</h3>
  <p>Platform Web UKM Game Development -- Universitas Andalas</p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Firebase-Aktif-orange?logo=firebase" alt="Firebase" />
    <img src="https://img.shields.io/badge/Versi-0.1.5-6366f1" alt="Versi" />
    <a href="https://unandnewgame-tan.vercel.app"><img src="https://img.shields.io/badge/Live-unandnewgame--tan.vercel.app-black?logo=vercel" alt="Live" /></a>
  </p>
</div>

---

NEWGAME adalah platform web terpadu UKM Game Development Universitas Andalas.
Monorepo dengan dua aplikasi: NestJS API (port 3001) dan Next.js Web (port 3000).

Anggota terdaftar : 125 orang (GEN 1 + GEN 2)
Firebase project  : qr-absensi-unandnewgame
Production URL    : https://unandnewgame-tan.vercel.app

---

Status Infrastruktur (Juni 2026)

  Firebase Firestore  aktif    -- sumber data utama production
  Firebase Auth       aktif    -- autentikasi semua anggota
  Upstash Redis       aktif    -- rate limiting + cache leaderboard TTL 60 detik
  Vercel              aktif    -- hosting frontend + API serverless
  PostHog             aktif    -- analytics penggunaan

  Cloudinary          butuh env  -- upload gambar/video, perlu CLOUDINARY_* env diisi
  SMTP Email          butuh env  -- notifikasi email, perlu SMTP_* env diisi
  Google OAuth        butuh setup -- perlu tambah redirect URI di Google Console

  PostgreSQL          direncanakan -- schema Prisma ada, data belum dipindah dari Firestore
  Docker              parsial      -- Dockerfile ada, belum diuji end-to-end
  Flutter             parsial      -- code ada di tools/mobile-simulator, belum production
  WebSocket           implemented  -- butuh server persistent, tidak bisa di Vercel serverless
  Zilliz / Milvus     direncanakan -- untuk semantic search, collection belum dibuat
  OpenAI API          direncanakan -- untuk text embedding, perlu API key

Detail tiap layanan, fungsi, cara pakai, dan env yang dibutuhkan: lihat EXTERNAL_SERVICES.md

---

Fitur yang sudah berjalan

  Backend API (NestJS):
    autentikasi via Firebase, Member ID, Google OAuth, 2FA TOTP RFC 6238
    CRUD member, bulk import CSV/JSON, search, export CSV
    QR scan idempotent, manual input kehadiran, penalti terlambat (-2 XP / 15 menit)
    event recurring (weekly/biweekly/monthly), reminder email + notif
    XP level, leaderboard Redis cache, season reset, bonus streak 4 tier
    WebSocket real-time (socket.io) + email Nodemailer
    upload media Cloudinary (gambar dan video 100MB)
    artikel, tutorial per pilar, YouTube embed, pencarian
    badge definisi + award manual/otomatis
    rate limiting (Upstash + fallback memory), anomaly detection

  Frontend (Next.js 14):
    landing page dengan animasi HeroTypewriter dan PirateMap Framer Motion
    login 2-tab (Login + Daftar), forgot password inline, 2FA TOTP
    dashboard dengan XP wave bar, stat cards, event upcoming
    leaderboard dengan filter generasi (GEN 1/2) dan pilar
    kalender bulan dengan titik event, sidebar detail, legenda warna
    direktori anggota dengan search, card grid, halaman profil klik-through
    pencarian artikel news dengan debounce
    edit profil (bio/skills/links), avatar, download profile card PNG
    koleksi badge dengan modal detail (rarity glow, progress bar)
    log aktivitas dengan filter tipe + tanggal + export CSV
    QR scanner dengan antrian offline (sync saat koneksi pulih)
    panel admin lengkap (member, event, berita, media, SIEM)
    GlobalSearch Cmd+K, dark mode, keyboard shortcuts

---

Format Member ID

  NG + [kode gen+batch] + [nomor urut] + [suffix pilar]

  Suffix pilar:
    PG -> Game Logic
    GD -> Game Design
    SF -> Game Sound

  Contoh: NG11020125SF = GEN 1, nomor 125, Game Sound

---

Sistem Role (8 level)

  npc           (0) -> belum diverifikasi, akses publik saja
  member        (1) -> dashboard, presensi, profil
  inventori     (2) -> + manajemen inventori
  admin         (3) -> + kelola member, event, berita
  quest keeper  (4) -> + ekspor data, laporan
  gold guardian (5) -> + manajemen keuangan
  code commander(6) -> + kelola role, buat admin
  pixel presiden(7) -> akses penuh

---

Cara Login

  Halaman /login punya 2 tab:

  Tab Login:
    - email + password Firebase
    - Member ID + password (backend lookup ke Firestore, lalu Firebase sign in)
    - Google OAuth
    - forgot password inline (tanpa pindah halaman)

  Tab Daftar:
    - verifikasi Member ID + Kode Akses
    - buat akun Firebase
    - profil dibuat otomatis

---

Setup Lokal

  Prasyarat:
    Node.js 20+
    file apps/api/serviceAccountKey.json (Firebase service account)
    PostgreSQL lokal atau connection string Neon/Supabase (opsional)

  Install dependencies:
    cd apps/api && npm install
    cd apps/web && npm install

  Konfigurasi env -- apps/api/.env:
    PORT=3001
    FRONTEND_URL=http://localhost:3000
    FIREBASE_PROJECT_ID=qr-absensi-unandnewgame
    FIREBASE_CLIENT_EMAIL=...
    FIREBASE_PRIVATE_KEY=...
    DATABASE_URL=postgresql://user:pass@localhost:5432/newgame
    UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
    UPSTASH_REDIS_REST_TOKEN=your-token
    CLOUDINARY_CLOUD_NAME=your-name
    CLOUDINARY_API_KEY=your-key
    CLOUDINARY_API_SECRET=your-secret
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your-email@gmail.com
    SMTP_PASS=your-app-password
    SMTP_FROM=NEWGAME <your-email@gmail.com>
    OPENAI_API_KEY=sk-...
    ZILLIZ_URI=https://...
    ZILLIZ_TOKEN=...

  Konfigurasi env -- apps/web/.env.local:
    NEXT_PUBLIC_API_URL=http://localhost:3001/api
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=qr-absensi-unandnewgame.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=qr-absensi-unandnewgame
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
    NEXT_PUBLIC_SITE_URL=http://localhost:3000

  Jalankan:
    Terminal 1: cd apps/api && npm run dev
    Terminal 2: cd apps/web && npm run dev
    Buka: http://localhost:3000/landing

  Via Docker (eksperimental, belum fully tested):
    docker compose up --build

---

Rencana Migrasi PostgreSQL

  Status: Firestore aktif, PostgreSQL standby (schema.prisma sudah ada).
  Migrasi dijadwalkan setelah platform stabil di production.
  Panduan lengkap: MIGRATION.md
  Langkah manual: MANUAL_TASKS.md bagian PostgreSQL

---

Struktur Proyek (ringkas)

  apps/api/         -> NestJS REST API
    prisma/         -> schema dan migration PostgreSQL
    src/modules/    -> 21 modul bisnis (auth, members, attendance, events, xp, ...)
    src/scripts/    -> seed-members.js, generate-api-collection.ts

  apps/web/         -> Next.js 14 frontend
    src/app/        -> halaman (login, landing, dashboard dan sub-halaman)
    src/components/ -> BadgeDetailModal, ActivityHeatmap, AnnouncementBanner, ...
    src/lib/        -> api.ts, errors.ts, attendance-sync.ts

  tools/            -> Flutter mobile simulator (parsial)
  scripts/          -> backup.mjs, migrate-firestore.mjs
  .github/workflows -> ci.yml, backup.yml

---

Dokumen Pendukung

  CHANGELOG.md         -> riwayat perubahan dari awal sampai sekarang
  TODO.md              -> fitur yang belum selesai
  MANUAL_TASKS.md      -> tugas wajib manual (credential, cloud, infra)
  EXTERNAL_SERVICES.md -> semua layanan eksternal, fungsi, env, dan status
  DEPLOYMENT_RUNBOOK.md-> panduan deploy ke production
  DEVELOPER_GUIDE.md   -> standar kode dan Git workflow
  SECURITY.md          -> arsitektur keamanan
  MIGRATION.md         -> panduan cutover Firestore ke PostgreSQL
  DESIGN.md            -> arsitektur dan design system platform
  MEMBER_CREDENTIALS.md-> RAHASIA -- 125 anggota + kode akses

---

CI/CD

  Push ke main     -> ci.yml -> TypeScript typecheck, npm audit, ESLint
  Cron 19.00 UTC   -> backup.yml -> pg_dump -> artifact retensi 30 hari
  Manual dispatch  -> backup.yml -> backup on-demand

---

MIT License -- 2026 NEWGAME, UKM Game Development Universitas Andalas