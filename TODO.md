NEWGAME v0.1.5 — Pending Features
UKM Game Development, Universitas Andalas
Last updated: 15 Juni 2026

Catatan: File ini hanya berisi fitur yang BELUM selesai.
Fitur yang sudah selesai → lihat CHANGELOG.md
Tugas manual → lihat MANUAL_TASKS.md

Status key:
  [~] = In progress / partially implemented
  [-] = Planned but not started

---

INFRASTRUKTUR

  Docker
    [~] docker-compose.yml ada, tapi belum fully tested end-to-end
        File: docker-compose.yml, apps/api/Dockerfile, apps/web/Dockerfile
        Test lokal: docker compose up --build
        Masalah potensial:
          - Volume mount path beda di Windows vs Linux
          - Urutan startup: Redis harus ready sebelum API
          - Hot reload di Docker membutuhkan watchman atau polling
        Perlu: testing di environment bersih (WSL2 atau Linux VM)

  Flutter Mobile App
    [~] Embedded di tools/mobile-simulator, tapi bukan git submodule resmi
        Status: code ada (Android WebView, bottom nav 5 halaman, drawer 11 halaman)
        Belum:
          - Build APK yang bisa didistribusikan
          - WebSocket support (push notif dari API)
          - Deep link ke halaman internal
          - Push notification via Firebase Cloud Messaging
          - Publish ke Play Store / internal track
        Perlu (manual): lihat MANUAL_TASKS.md #10

  PostgreSQL Migration
    [~] Schema ada (Prisma), data belum dipindahkan dari Firestore
        Status: Firestore = sumber data aktif, PostgreSQL = standby
        Langkah yang tersisa:
          [-] Jalankan migrasi Prisma di production DB (manual, MANUAL_TASKS.md #3)
          [-] Update service layer: ganti FirebaseService → PrismaService per modul
          [-] Update Prisma schema role enum (lama: TRAINEE,ADMIN,OWNER → baru: 8 role)
          [-] End-to-end testing setelah cutover
          [-] Dual-write period (tulis ke keduanya) sebelum full cutover
        Panduan lengkap: MIGRATION.md

  Staging Environment
    [-] Vercel project terpisah untuk staging (env vars berbeda dari production)
        Langkah: buat project baru di Vercel, set NEXT_PUBLIC_API_URL ke staging API


  Authentication
    [~] Better Auth session fully replacing Firebase Auth (masih hybrid — dual-write)

  XP & Leaderboard
    [~] XP history per member (endpoint parsial, belum lengkap)

  News
    [~] Image upload via Cloudinary untuk cover artikel
        (endpoint ada di backend, butuh CLOUDINARY env valid — lihat MANUAL_TASKS.md #6)

  Notifications
    (Semua sudah diimplementasikan. Lihat CHANGELOG.md v0.1.5)

  AI Module
    [-] Semantic news search via vector similarity (Milvus/Zilliz)
        Butuh: setup collection di Zilliz, index artikel yang sudah ada
        Lihat: MANUAL_TASKS.md #11
    [-] Member recommendation engine (AI/ML)
        Butuh: data training, model selection, endpoint integration

  Security
    [-] PQCrypto — post-quantum cryptography
        Lihat: MANUAL_TASKS.md #13
    [-] Automated secret rotation via CI/CD
        Lihat: MANUAL_TASKS.md (bagian infrastruktur)
    [-] Anomaly alerting via webhook (PagerDuty/OpsGenie)
        Lihat: MANUAL_TASKS.md #12

---

FRONTEND — NEXT.JS WEB

  Authentication
    [~] Better Auth session fully replacing Firebase (masih hybrid)
    [-] Email verification resend button
        (perlu Firebase sendEmailVerification + UI di login page)

  Landing Page
    [-] Internationalization — EN/ID language toggle

  Dashboard
    (Weekly activity heatmap sudah dibuat sebagai komponen ActivityHeatmap.tsx)
    [-] Integrasikan ActivityHeatmap ke dashboard page — perlu fetch attendance history

  News
    [-] Related articles sidebar
        (logika: ambil artikel dengan tag/kategori serupa, tampilkan di sidebar)

  Members
    [-] Add event form dari Calendar (admin only)
        (tombol tambah event di kalender → modal form admin)

  Authentication
    [-] Email verification resend button (di login/profile page)

---

INFRASTRUKTUR

  [-] Staging environment terpisah dari production
      (buat Vercel project terpisah untuk staging, env vars berbeda)

---

DOKUMENTASI

  [-] Internationalization guide (jika fitur i18n diimplementasikan)

---

CATATAN SESI

  Sesi 1 (14 Jun 2026): 2FA, attendance export/manual/late, recurring events,
    GlobalSearch, ToastQueue, ProfileEdit, ProfileCard download, KeyboardShortcuts,
    Admin attendance/import/SIEM pages. Commit: 0fa4114

  Sesi 2 (14-15 Jun 2026): WebSocket, Nodemailer email, video upload, XP export,
    Calendar events, Members search+profile, Logs filter+export, Leaderboard gen filter,
    AnnouncementBanner, ActivityHeatmap, BadgeDetailModal, SEO metadata,
    API collection generator, Deployment runbook. Commit: f170c31

  Sesi 3 (15 Jun 2026): MANUAL_TASKS.md, TODO cleanup, CHANGELOG update,
    README update. Commit: [current]

---

NEWGAME v0.1.5 — UKM Game Development, Universitas Andalas
