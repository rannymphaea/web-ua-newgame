Riwayat Pembaruan NEWGAME
UKM Game Development, Universitas Andalas

Disusun dari yang paling lama ke yang paling baru.

---

3 Mei 2026

Halaman detail profil anggota dengan riwayat aktivitas. Kalender kegiatan interaktif.
Banner pengumuman darurat untuk admin. Heatmap mingguan analisis kehadiran.

---

14 Mei 2026

Migrasi dari sistem lama berbasis HTML/JS mandiri ke monorepo terpadu.
Lebih dari 12.000 file konfigurasi lama dihapus.
16 modul backend dibuat untuk menangani kebutuhan sistem.

---

20 Mei 2026

Integrasi materi dari guidebook resmi NEWGAME ke halaman landing.
Semua ikon emoji di UI publik diganti ikon SVG.
Komponen landing dipecah menjadi lebih modular.

---

Sesi 1 — Setup Dasar

Next.js untuk frontend, NestJS untuk backend, Firestore dan Firebase Auth sebagai
infrastruktur data awal. Modul error handling global dan sistem tema visual dibuat
di sesi ini.

---

Sesi 2 — Dashboard dan Pengguna

Halaman login dengan Firebase Auth, dashboard anggota, scan QR absensi, halaman
lencana, leaderboard, dan panel admin dengan manajemen berita, media, dan analytics.

---

Sesi 3 — Landing Page

Desain ulang total landing page. Animasi typewriter di hero, seksi visi misi, struktur
pengurus, pengenalan pilar. Pirate Map untuk perjalanan anggota dan efek suara interaktif.

---

Sesi 4 — Keamanan

SecurityModule NestJS berisi rate limiting, validasi JWT, CORS, Helmet, dan filter input.
Fondasi anomaly detection dan forensic logging dipasang di sesi ini.

---

Sesi 5 — XP Bar

Bar XP setinggi 30px ditambahkan secara horizontal di bagian atas halaman.
Animasi gelombang SVG dan warna berubah otomatis sesuai level pengguna.

---

Sesi 6 — Performa

Auth store memanfaatkan cache IndexedDB Firebase agar status login dimuat instan.
Dashboard menggunakan dua fase: pertama data dari Zustand cache, kedua dari server.
CSS Remix Icon dimuat async, font Cormorant dihapus dari dashboard.

---

Sesi 7 — Guidebook

Penambahan kartu Guidebook di dashboard dan landing page.
Seksi baru sebelum CTA dengan animasi Framer Motion.

---

29 Mei 2026

Migrasi Storage ke Cloudinary karena Firebase Storage memerlukan upgrade berbayar.
Media service backend ditulis ulang menggunakan cloudinary.uploader.upload_stream.

Perbaikan upload foto profil: error unknown_system_error diselesaikan. Akar masalah
adalah makePublic() yang selalu gagal karena Firebase Storage belum aktif, dan error
aslinya tertimpa pesan generik sehingga tidak pernah sampai ke frontend.

Klik karakter Yua di dashboard memicu animasi bounce dan memutar yua-select.mp3
dengan cooldown 600ms. Avatar Yua di profil menampilkan gambar langsung, badge "NEW"
dihapus, warna aksen diubah ke biru.

Konsolidasi semua file .md yang terpencar menjadi satu set dokumen terpadu.

Vercel deploy diperbaiki: vercel.json yang memblokir deployment dibenahi, hostname
Cloudinary ditambahkan ke remotePatterns.

---

v0.1.1 -- Juni 2026

Rilis ini merupakan perombakan total arsitektur data, pengerasan keamanan, optimasi
performa, dan penambahan alat simulator.

Arsitektur dan database:
  Prisma dan PostgreSQL -- migrasi dari Firestore-centric ke relasional (Neon Serverless).
  Skema mencakup 9 model: User, UserProfile, Session, NewsArticle, Event, Attendance,
  XpHistory, Activity, Notification.
  Better Auth diintegrasikan dengan Prisma adapter untuk sesi mandiri di database.
  Upstash Redis dipasang global untuk caching leaderboard dan rate limiting.
  Milvus Vector DB disiapkan untuk pencarian semantik via text embedding OpenAI.

Keamanan:
  ResponseInterceptor menstandarkan semua respons ke format terpadu.
  AllExceptionsFilter dipasang global untuk logging forensik.
  Baris console.log("GROQ KEY:") yang bocorkan API key dihapus.

Alat developer:
  Web Mobile Simulator di route /dev-tools (8 preset perangkat, portrait/landscape).
  Flutter Desktop Simulator di tools/mobile-simulator/ untuk preview live web frame.
  PirateMap.tsx ditulis ulang dengan diagram pohon interaktif dan animasi stroke SVG.
  PostHog Analytics diintegrasikan untuk perekaman interaksi pengguna.

---

v0.1.2 -- 5 Juni 2026

Security hotfix: semua Firebase credentials yang hardcoded di source code dihapus.
.vercelignore dibuat agar file upload ke Vercel turun dari 18.119 ke di bawah 15.000.
.gitignore diperkuat dengan pattern serviceAccountKey*.json, semua varian .env.

Landing page:
  HeroTypewriter bersiklus di 4 frasa dengan gradient dan efek glitch chromatic aberration.
  PirateMap ditulis ulang menjadi flowchart vertikal dengan Framer Motion spring.

Bug login: setelah login pengguna kembali ke /landing karena Firebase belum resolve session.
Fix: debounce redirect 1.2-2.5 detik + sessionStorage flag ng-just-logged-in.

IdleSessionManager: auto-logout 30 menit idle, warning dialog 2 menit sebelumnya
dengan SVG countdown ring, tracking 6 event type via AbortController.

CI fix: npm ci --prefer-offline diganti npm install --legacy-peer-deps di semua step.

---

v0.1.3 -- 10 Juni 2026

Rilis ini menutup 6 gap kritis dari audit platform v0.1.1.

Login via Member ID: anggota bisa login dengan Member ID (format NG11020125SF) tanpa
perlu ingat email. Endpoint POST /api/auth/lookup-id mencari email di Firestore
(rate-limited 5 req/15 menit), mengembalikan email ter-mask ke frontend.

Error handling Bahasa Indonesia: 40+ mapping HTTP status dan domain error ke pesan
ramah pengguna. API client melempar ApiError dengan friendlyMessage siap tampil.
Komponen ErrorBanner.tsx baru untuk error persisten.

Presensi QR offline: scan saat jaringan tidak stabil disimpan ke localStorage dan
dikirim ulang otomatis saat koneksi pulih. Max retry 3x, expire 1 jam. Endpoint
/attendance/process dibuat idempotent: duplicate scan mengembalikan alreadyRecorded
alih-alih error.

Sistem role diperbarui ke terminologi resmi NEWGAME:
  npc (0), member (1), inventori (2), admin (3), quest keeper (4),
  gold guardian (5), code commander (6), pixel presiden (7).

Backup otomatis: scripts/backup.mjs ekspor PostgreSQL ke SQL. GitHub Actions backup.yml
jalan setiap hari jam 02.00 WIB, simpan artifact 30 hari.

Script migrasi Firestore ke PostgreSQL: scripts/migrate-firestore.mjs dengan flag
--dry-run dan --collection. Panduan cutover di MIGRATION.md.

---

v0.1.4 -- 13 Juni 2026

Fix registrasi dan login: NEXT_PUBLIC_API_URL tidak ada di .env.local menyebabkan
frontend kirim request ke Next.js sendiri, server kembalikan HTML 404, lalu
JSON.parse crash dengan pesan tidak jelas. Fix: tambah env var, harden api.ts untuk
deteksi respons HTML sebelum parse, semua fetch().json() diganti safeParseJson().

Rename versi: seluruh referensi V1.x diganti ke skema 0.1.x di semua file.
Hapus direktori kosong apps/laravel/ dan security/stubs/laravel/.

---

v0.1.5 -- 14-15 Juni 2026

Rilis ini merupakan penambahan fitur terbesar sejak platform berdiri.
Dikerjakan dalam 3 sesi berturut-turut.

Sesi 1 -- 14 Juni, core features:

  Login 2-tab: 3 tab digabung menjadi 2 (Login + Daftar). Tab login berisi
  toggle Email/MemberID + Google OAuth + forgot password dalam satu tampilan.

  2FA TOTP: setup, verify, validate, disable. Implementasi murni Node.js crypto
  tanpa library eksternal. QR code otpauth URI untuk Google Authenticator.

  Backend: pencarian member by nama/pilar/generasi, export CSV member dan absensi,
  XP season reset dengan decay persen, bonus XP streak 4 tier (3/7/14/30 hari),
  input absensi manual oleh trainer, penalti terlambat -2 XP per 15 menit maks -10,
  recurring events (weekly/biweekly/monthly, auto-generate maks 12 instance),
  paginasi media gallery.

  Frontend: GlobalSearch Cmd+K dengan navigasi arrow key, toast queue stacked maks 5
  dengan auto-dismiss, ProfileEditModal (bio/GitHub/LinkedIn/skills), download profile
  card sebagai PNG via canvas, keyboard shortcut system dengan overlay bantuan.

  Admin: halaman absensi dengan filter dan CSV export, bulk import member UI
  (CSV + JSON + detail error per baris), SIEM log viewer dengan severity badge,
  paginasi, dan modal detail.

  Docker Compose untuk local dev (API + Web + Redis). DESIGN.md dibuat.

Sesi 2 -- 15 Juni, backend dan frontend features:

  Backend baru:
    WebSocket real-time via NotificationsGateway (socket.io). Setiap user punya
    room sendiri user:{uid}. Mendukung notif personal dan emergency broadcast.
    Email via Nodemailer SMTP, konfigurasi lewat env SMTP_HOST/USER/PASS.
    Event reminder: kirim notif Firestore + email blast ke semua anggota.
    Upload video ke Cloudinary (resource_type:video, maks 100MB, mp4/webm/mov).
    Export riwayat XP ke CSV dengan filter userId dan date range.
    Endpoint notifikasi baru: GET /notifications, PATCH read, GET broadcasts, dismiss.

  Frontend baru:
    News: search bar dengan debounce dan tombol clear.
    Members: direktori dengan search nama/pilar, card grid, halaman profil klik-through
    lengkap dengan XP bar, stats, bio, skills, GitHub/LinkedIn.
    Calendar: tampilan bulan dengan titik event per tanggal, sidebar detail, legenda warna.
    Logs: filter tipe aksi dan date range, export CSV.
    Leaderboard: filter generasi GEN 1/GEN 2, ikon piala top-3.
    AnnouncementBanner: pengumuman darurat dari admin, polling 60 detik, bisa dismiss.
    ActivityHeatmap: komponen grid 16 minggu bergaya GitHub.
    BadgeDetailModal: glow sesuai rarity, progress bar, tanggal unlock.
    SEO: metadata lengkap di layout.tsx (OpenGraph, Twitter card, robots, canonical).

  Dokumentasi: DEPLOYMENT_RUNBOOK.md, generator Postman/Insomnia collection.

Sesi 3 -- 15 Juni, dokumentasi dan cleanup:

  MANUAL_TASKS.md dibuat: semua tugas wajib manual dipisahkan ke file tersendiri,
  diurutkan berdasarkan urgensi (urgent/penting/opsional). Berisi rencana detail
  migrasi PostgreSQL, Flutter production, dan pengujian Docker.

  TODO.md ditulis ulang: hanya berisi item pending. Item selesai dipindah ke sini.
  Seksi infrastruktur ditambahkan (Docker, Flutter, PostgreSQL, staging).

  README.md diperbarui menyeluruh: tabel status infrastruktur, daftar fitur lengkap,
  pohon struktur proyek, semua env var, seksi Docker dan migrasi PostgreSQL.

---

NEWGAME UKM Game Development, Universitas Andalas
