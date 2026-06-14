NEWGAME v0.1.5 -- Pending Features
UKM Game Development, Universitas Andalas
Diperbarui: 15 Juni 2026

File ini hanya berisi item yang belum selesai.
Selesai   -> lihat CHANGELOG.md
Manual    -> lihat MANUAL_TASKS.md
Eksternal -> lihat EXTERNAL_SERVICES.md

Keterangan:
  [~] sudah dimulai tapi belum selesai
  [-] direncanakan, belum dimulai

---

infrastruktur

  Docker
    [~] docker-compose.yml dan Dockerfile ada, belum diuji end-to-end
        file: docker-compose.yml, apps/api/Dockerfile, apps/web/Dockerfile
        coba: docker compose up --build
        masalah yang mungkin muncul:
          - volume mount path beda di Windows vs Linux
          - urutan startup: Redis harus siap sebelum API jalan
          - hot reload perlu CHOKIDAR_USEPOLLING=true di container
        perlu pengujian di WSL2 atau Linux VM yang bersih

  Flutter Mobile App
    [~] ada di tools/mobile-simulator, bukan git submodule resmi
        sudah ada: Android WebView, navigasi bawah 5 halaman, drawer 11 halaman
        belum ada:
          - build APK yang bisa disebarkan
          - koneksi WebSocket untuk push notif
          - deep link ke halaman spesifik
          - Firebase Cloud Messaging
          - publish ke Play Store
        detail langkah -> MANUAL_TASKS.md bagian Flutter

  PostgreSQL
    [~] schema Prisma sudah ada, data belum dipindahkan dari Firestore
        Firestore masih aktif sebagai sumber data utama
        yang perlu dikerjakan:
          [-] jalankan prisma migrate deploy di database production
          [-] update service layer: ganti FirebaseService ke PrismaService per modul
          [-] update enum role di schema Prisma (lama: TRAINEE/ADMIN/OWNER)
          [-] dual-write period sebelum full cutover
          [-] testing end-to-end setelah cutover
        panduan lengkap: MIGRATION.md

  Staging
    [-] buat Vercel project terpisah untuk staging dengan env vars berbeda

---

backend

  Autentikasi
    [~] Better Auth belum sepenuhnya menggantikan Firebase Auth, masih hybrid
    [~] riwayat XP per anggota, endpoint parsial

  Cloudinary
    [~] upload cover artikel sudah ada di backend, butuh env CLOUDINARY valid
        detail setup: EXTERNAL_SERVICES.md dan MANUAL_TASKS.md

  AI
    [-] pencarian berita semantik via vector similarity (Milvus/Zilliz)
        perlu: buat collection di Zilliz, index artikel yang sudah ada
        detail: MANUAL_TASKS.md dan EXTERNAL_SERVICES.md
    [-] rekomendasi anggota berbasis kesamaan aktivitas/pilar

  Keamanan
    [-] post-quantum cryptography (interface sudah ada, butuh library liboqs)
    [-] rotasi secret otomatis via CI/CD
    [-] alerting webhook saat anomaly score tinggi (PagerDuty/OpsGenie)

---

frontend

  Autentikasi
    [-] tombol kirim ulang email verifikasi (Firebase sendEmailVerification)
    [~] Better Auth belum sepenuhnya menggantikan Firebase (masih hybrid)

  Dashboard
    [-] integrasikan komponen ActivityHeatmap ke halaman dashboard
        komponen sudah ada di components/profile/ActivityHeatmap.tsx
        perlu: fetch riwayat absensi dari API

  Berita
    [-] sidebar artikel terkait (artikel dengan tag atau kategori yang sama)

  Kalender
    [-] form tambah event dari halaman kalender (admin only)

  Umum
    [-] toggle bahasa Indonesia / Inggris

---

catatan sesi

  Sesi 1 (14 Jun): 2FA, export absensi/member, recurring events, GlobalSearch,
  ToastQueue, ProfileEdit, ProfileCard download, KeyboardShortcuts, halaman
  admin attendance/import/SIEM. Commit: 0fa4114

  Sesi 2 (15 Jun): WebSocket, email Nodemailer, video upload, export XP,
  Calendar events, Members search+profil, Logs filter+export, Leaderboard filter,
  AnnouncementBanner, ActivityHeatmap, BadgeDetailModal, SEO, API collection,
  Deployment runbook. Commit: f170c31

  Sesi 3 (15 Jun): MANUAL_TASKS.md, EXTERNAL_SERVICES.md, TODO dan CHANGELOG
  dirapikan, README diperbarui. Commit: current

---

NEWGAME v0.1.5 -- UKM Game Development, Universitas Andalas
