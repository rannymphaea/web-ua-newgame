# Riwayat Pembaruan — NEWGAME

Catatan lengkap perjalanan pengembangan platform NEWGAME UKM Game Development Universitas Andalas. Entri diurutkan dari yang paling baru.

---

### v0.1.5 — 14 Juni 2026

#### Login & Auth
- **Login tabs merged**: 3 tabs (Email/MemberID/Daftar) → 2 tabs (Login/Daftar)
- Login tab now has Email/Member ID toggle + Google sign-in in one view
- **Forgot password flow** — inline Firebase sendPasswordResetEmail
- **Duplicate registration guard** — detects email-already-in-use and memberId already registered
- **2FA for admin accounts** — TOTP RFC 6238, setup/verify/validate/disable endpoints
  - Pure Node.js crypto implementation (no external TOTP library)
  - QR code otpauth URI generation for Google Authenticator

#### Backend Features
- **Member search** — search by name, pillar, or generation (query params)
- **Generation filter** — NG1xxx = GEN 1, NG2xxx = GEN 2
- **Export members CSV** — `GET /members/export/csv` with division/status/generation filters
- **XP season reset** — `POST /xp/season-reset` with configurable decay percentage
- **XP streak bonus** — `POST /xp/streak-bonus/:userId` with 4 tiers (3/7/14/30 days)
- **Attendance export CSV** — `GET /attendance/export/csv` with event/date filters
- **Manual attendance input** — `POST /attendance/manual` for trainers (quest keeper+)
- **Late check-in penalty** — automatic -2 XP per 15min late (max -10)
- **Recurring events** — weekly/biweekly/monthly with auto-generation of future instances
- **Media gallery pagination** — `GET /media?page=&limit=` support

#### Frontend Features
- **Global search (Cmd+K)** — full-page search modal with arrow key navigation
- **Toast queue system** — stacked toasts (max 5), auto-dismiss, slide-in animation
- **ToastProvider** context — `useToast()` hook with `showError()` / `showSuccess()`

#### Infrastructure
- **Docker Compose** — full-stack local dev setup (API + Web + Redis)
- **Dockerfiles** — separate Dockerfiles for API (NestJS) and Web (Next.js)

#### Documentation
- **DESIGN.md** — comprehensive platform design document
  - Architecture diagram, design system tokens, page inventory
  - Role hierarchy, auth flow diagram, 4-batch implementation plan

---

### v0.1.4 -- 13 Juni 2026

#### Fix Registrasi & Login

**Root cause:** `NEXT_PUBLIC_API_URL` tidak ada di `.env.local` -- frontend mengirim request ke Next.js sendiri (bukan backend NestJS) -- server mengembalikan HTML 404 -- `JSON.parse("<!DOCTYPE...")` crash.

Fix:
- Tambah `NEXT_PUBLIC_API_URL=http://localhost:3001/api` ke `.env.local`
- Harden `api.ts`: deteksi respons HTML sebelum JSON.parse
- Harden `login/page.tsx`: semua `fetch().json()` diganti `safeParseJson()` helper
- Error message dalam Bahasa Indonesia saat backend tidak berjalan

#### Rename Versi v1.x ke v0.1.x

Seluruh referensi versi platform diganti ke skema `0.x.y`:

| Lama | Baru |
|---|---|
| V1.0 | v0.1.0 |
| V1.1 | v0.1.1 |
| V1.1.5 | v0.1.2 |
| V1.2 | v0.1.3 |
| (sesi ini) | v0.1.4 |

File yang diperbarui: README, CHANGELOG, TODO, DEVELOPER_GUIDE, SECURITY, MIGRATION, MEMBER_REGISTRATION, 3x package.json, 4x source code, 3x sub-README

#### Pembersihan

- Hapus `apps/laravel/` (direktori kosong, tidak terpakai)
- Hapus `security/stubs/laravel/` (stub placeholder)

---

### v0.1.3 — 10 Juni 2026

Rilis ini menutup 6 gap kritis yang diidentifikasi dari audit platform v0.1.1. Fokus utama: stabilitas autentikasi, ketahanan presensi QR offline, penguatan sistem role, dan fondasi operasional jangka panjang.

#### 🔑 Login via NEWGAME Member ID

Anggota kini dapat login menggunakan **Member ID** mereka (format `NG11020125SF`) tanpa perlu mengingat alamat email. Halaman login memiliki 3 tab: **Email**, **Member ID**, dan **Daftar**.

Implementasi: endpoint `POST /api/auth/lookup-id` menerima Member ID, mencari email terdaftar di Firestore (rate-limited 5 req/15 menit untuk mencegah enumerasi), lalu mengembalikan email ter-mask (`r*****a@email.com`) ke frontend. Frontend menggunakan email asli tersebut untuk `signInWithEmailAndPassword` Firebase.

File yang diubah: `auth.service.ts`, `auth.controller.ts`, `apps/web/src/app/login/page.tsx`

#### ðŸŒ Error Handling Bahasa Indonesia

Semua error dari API kini dipetakan ke pesan ramah pengguna dalam Bahasa Indonesia. Library `errors.ts` mendefinisikan 40+ mapping untuk HTTP status code dan domain-specific error code (QR expired, akun suspended, rate limited, dsb).

API client (`api.ts`) kini melempar `ApiError` (bukan `Error` biasa) yang sudah memiliki `friendlyMessage` siap tampil. `Toast.tsx` mendapat method baru `showError(error)` yang menerima error apapun dan menampilkan pesan yang tepat secara otomatis. Komponen `ErrorBanner.tsx` baru untuk error persisten yang perlu perhatian user.

File baru: `lib/errors.ts`, `components/ui/ErrorBanner.tsx`
File diperbarui: `lib/api.ts`, `components/ui/Toast.tsx`

#### ðŸ“¶ Presensi QR Offline (Resiliensi Jaringan)

Scan QR saat jaringan tidak stabil kini tidak langsung gagal. `AttendanceSyncService` menyimpan scan yang gagal ke localStorage dan mencoba kirim ulang otomatis saat koneksi pulih. Max retry 3x, expire setelah 1 jam.

Halaman scan menampilkan badge "X absensi menunggu sinkronisasi" dan state baru `queued` dengan pesan "Absen Disimpan â€” akan dikirim saat koneksi pulih". Endpoint `/attendance/process` dibuat idempotent: duplicate scan mengembalikan `{ alreadyRecorded: true }` alih-alih error, aman untuk retry.

File baru: `lib/attendance-sync.ts`
File diperbarui: `attendance.service.ts`, `(dashboard)/scan/page.tsx`

#### ðŸ‘‘ Sistem Role Diperbarui

Role system sebelumnya (`npc, member, pengurus, inventori, admin, superadmin, presiden`) diganti dengan terminologi resmi NEWGAME:

| Baru | Level | Sebelumnya |
|---|---|---|
| `npc` | 0 | `npc` |
| `member` | 1 | `member` |
| `inventori` | 2 | `inventori` |
| `admin` | 3 | `admin` |
| `quest keeper` | 4 | â€” |
| `gold guardian` | 5 | â€” |
| `code commander` | 6 | `superadmin` |
| `pixel presiden` | 7 | `presiden` |

Permission matrix lengkap didefinisikan di `constants/roles.ts`. `RolesGuard` diperbarui untuk import dari sana. NPC kini mendapat pesan error eksplisit dalam Bahasa Indonesia. Prisma schema Role enum diperbarui.

File baru: `common/constants/roles.ts`
File diperbarui: `common/guards/roles.guard.ts`, `prisma/schema.prisma`, `auth.service.ts`, `auth.controller.ts`

#### ðŸ’¾ Backup Database Otomatis

Script `scripts/backup.mjs` mengekspor PostgreSQL ke file SQL dengan nama `backup-YYYY-MM-DD-HH.sql`. GitHub Actions workflow `backup.yml` menjalankan backup setiap hari jam **02.00 WIB** dan menyimpan hasilnya sebagai artifact dengan retensi 30 hari. Backup juga bisa dipicu manual dari GitHub Actions UI.

File baru: `scripts/backup.mjs`, `.github/workflows/backup.yml`

#### ðŸ”„ Script Migrasi Firestore â†’ PostgreSQL

`scripts/migrate-firestore.mjs` membaca koleksi `users`, `events`, dan `attendance` dari Firestore lalu meng-upsert ke PostgreSQL via Prisma. Mendukung `--dry-run` (preview tanpa write) dan `--collection` untuk migrasi per-koleksi. Mapping role lama ke role baru dilakukan otomatis. Panduan cutover lengkap di `MIGRATION.md`.

File baru: `scripts/migrate-firestore.mjs`, `MIGRATION.md`

#### ðŸ§¹ Pembersihan Arsitektur

- Dihapus: `scripts/setup-laravel.ps1` (tidak relevan), `trae-test/` directory, `desktop.ini`
- Dihapus: `LAPORAN.md` (konten digabung ke README dan CHANGELOG)
- README diperbarui total: role table, Member ID format, struktur proyek terkini, backup docs

---


### v0.1.2 â€” 5 Juni 2026

Rilis ini berfokus pada perbaikan UX landing page, keamanan sesi, dan stabilitas pipeline CI/CD. Dibagi dalam 3 bagian utama.

#### ðŸ”’ Security Hotfix â€” 5 Juni 2026 (Commit 6c63c87)

**KRITIS: Hapus Firebase credentials yang hardcoded di source code.**

File `apps/web/src/lib/firebase.ts` sebelumnya memiliki nilai fallback hardcoded untuk semua Firebase config (API key, project ID, appId, messagingSenderId). Meskipun Firebase Web API key bersifat semi-publik, keberadaannya di source code dianggap buruk secara praktik. Semua fallback dihapus â€” nilai sekarang wajib berasal dari environment variables.

`.vercelignore` dibuat untuk membatasi upload Vercel CLI dari 18.119 file menjadi di bawah 15.000 (batas Vercel). File yang dikecualikan: `node_modules`, `apps/api`, `tools`, `flutter`, `assets`, dokumen internal.

`.gitignore` diperkuat: tambah pattern `**/serviceAccountKey*.json`, semua varian `.env.*`, Prisma generated client, dan coverage output.

#### PART 1 â€” Landing Page: Hero Multi-Phrase Typewriter

Teks hero kini menggunakan `HeroTypewriter` yang bersiklus di empat frasa: **NEWGAME** â†’ **LEARN Â· CREATE** â†’ **PLAY Â· WIN** â†’ **LEVEL UP**. Setiap frasa memiliki gradient warna berbeda (gold, lavender, hijau, biru) + animasi shimmer. Transisi antar frasa disertai efek glitch chromatic aberration (RGB split, 280ms) dan 8 partikel radial burst.

PirateMap ditulis ulang total menjadi flowchart **vertikal** menggunakan Framer Motion. Animasi unik per elemen: spring bounce untuk stage nodes, draw-stroke untuk connector lines, star burst pada Soldat terminal, tooltip hover per tahap, dan slide-in dari kiri untuk versi mobile.

#### PART 2 â€” Fix Redirect Login â†’ Dashboard

Bug: setelah login, pengguna kembali ke `/landing` karena dashboard layout mendeteksi `user = null` sebelum Firebase resolve session.

Fix: debounce redirect 1.2â€“2.5 detik + `sessionStorage` flag `ng-just-logged-in` yang di-set setelah login berhasil. Root page timeout diperpanjang 600ms â†’ 1500ms. Redirect diubah ke `/login` bukan `/landing`.

#### PART 3 â€” IdleSessionManager + CI/CD Fix

`IdleSessionManager` baru: auto-logout setelah 30 menit idle, warning dialog 2 menit sebelum logout dengan SVG countdown ring animasi, tracking 6 event types via `AbortController`, dan penanganan tab visibility change.

CI fix: `npm ci --prefer-offline` â†’ `npm install --legacy-peer-deps` di semua step. Root `package-lock.json` diregenerasi. `apps/web/.eslintrc.json` dibuat agar lint tidak interaktif di CI.

---

### v0.1.1 â€” Juni 2026

Rilis ini merupakan perombakan total arsitektur data, pengerasan keamanan sistem, optimasi performa backend dan frontend secara menyeluruh, serta penambahan alat simulator untuk kenyamanan developer.

#### Arsitektur dan Database

Prisma dan PostgreSQL â€” Migrasi sistem database utama dari Firestore-centric ke arsitektur relasional menggunakan PostgreSQL (Neon Serverless). Skema mencakup 9 model utama: User, UserProfile, Session, NewsArticle, Event, Attendance, XpHistory, Activity, dan Notification.

Better Auth â€” Integrasi Better Auth dengan Prisma adapter untuk mengelola sesi pengguna secara mandiri di database relasional. Mendukung login Email/Password dan Google OAuth.

Upstash Redis â€” Pemasangan global RedisModule berbasis Upstash Redis REST SDK untuk caching leaderboard, cache profil pengguna, dan penanganan rate limiting.

Milvus Vector DB â€” Penyediaan VectorService berbasis Milvus SDK Node untuk pencarian semantik dan pencarian berita terkait menggunakan text embedding OpenAI.

#### Keamanan dan Kualitas Kode

Global Response Interceptor â€” Pembuatan ResponseInterceptor NestJS untuk menstandardisasi semua HTTP Response ke format terpadu `{ success, data, meta, timestamp }`.

Global Exception Filter â€” Pendaftaran AllExceptionsFilter secara global di `main.ts` untuk logging forensik dan penyusunan respons error yang seragam.

Perbaikan Kebocoran Kunci â€” Penghapusan baris `console.log("GROQ KEY:", ...)` pada `providers.ts` yang berpotensi mengekspos API key ke log produksi. Diganti dengan pengecekan panjang karakter yang aman.

Supresi CSS Warning â€” Penambahan pengecualian aturan `@theme` Tailwind CSS v4 di `.vscode/settings.json` agar tidak memunculkan false-positive warning di IDE.

#### Alat Developer dan Tampilan

Web Mobile Simulator â€” Pembuatan halaman simulator di route `/dev-tools`, dilengkapi 8 preset perangkat, toggle portrait/landscape, quick navigation links, dan slider skala tampilan.

Flutter Desktop Simulator â€” Aplikasi simulator eksternal berbasis Flutter Desktop di `tools/mobile-simulator/` untuk preview live web frame secara real-time.

PirateMap Interaktif â€” Penulisan ulang komponen PirateMap.tsx dengan visualisasi pohon diagram interaktif, animasi stroke SVG, junction nodes, dan panel deskripsi saat hover.

PostHog Analytics â€” Integrasi PostHog provider di frontend untuk perekaman demografi dan pelacakan event interaksi pengguna secara real-time.

---

### 29 Mei 2026

Migrasi Storage ke Cloudinary â€” Firebase Storage memerlukan upgrade berbayar sehingga layanan dipindah ke Cloudinary. Media service di backend ditulis ulang sepenuhnya menggunakan `cloudinary.uploader.upload_stream` via readable stream.

Perbaikan Upload Foto Profil â€” Error `unknown_system_error` yang sudah lama muncul diselesaikan. Akar masalahnya: `makePublic()` selalu gagal karena Firebase Storage belum diaktifkan, dan error aslinya tidak pernah mencapai frontend karena tertimpa pesan generik.

Interaksi Karakter Yua di Dashboard â€” Gambar Yua di hero section sekarang dapat diklik. Klik memicu animasi bounce dalam 400ms dan memutar `yua-select.mp3`. SFX memiliki cooldown 600ms untuk mencegah spam.

Tampilan Avatar Yua di Halaman Profil â€” Tombol pilih avatar Yua menampilkan gambar karakter secara langsung. Badge "NEW" dihapus. Warna aksen Yua diubah ke biru (`#3b82f6`).

Konsolidasi Dokumentasi â€” Semua file `.md` yang terpencar digabungkan dan distandarisasi menjadi satu set dokumen terpadu.

Perbaikan Deploy Vercel â€” `vercel.json` yang sebelumnya memblokir deployment diperbaiki. Rewrite API di `next.config.js` sekarang hanya aktif saat development. Hostname Cloudinary ditambahkan ke `remotePatterns` untuk optimasi gambar.

---

### Sesi 7

Integrasi Guidebook â€” Penambahan kartu Guidebook di dashboard dan landing page. Di landing, terdapat seksi baru sebelum CTA dengan animasi Framer Motion.

---

### Sesi 6

Optimasi Performa â€” Auth store memanfaatkan cache IndexedDB Firebase agar status login dimuat instan. Dashboard menggunakan dua fase â€” fase pertama menampilkan data dari Zustand cache, fase kedua mengambil data terbaru dari server. CSS Remix Icon dimuat secara async dan font Cormorant dihapus dari dashboard untuk menghemat bundle size.

---

### Sesi 5

XP Liquid Bar di TopBar â€” Bar XP setinggi 30px ditambahkan secara horizontal di bagian atas halaman. Animasi gelombang SVG dan warna berubah otomatis sesuai level pengguna.

---

### Sesi 4

Pengerasan Keamanan â€” SecurityModule NestJS dibuat berisi rate limiting, validasi JWT, CORS, Helmet, dan filter input. Fondasi anomaly detection dan forensic logging dipasang di sesi ini.

---

### Sesi 3

Landing Page Premium â€” Desain ulang total landing page. Animasi typewriter di hero, seksi visi misi, struktur pengurus, dan pengenalan pilar. Pirate Map untuk perjalanan anggota dan efek suara interaktif.

---

### Sesi 2

Halaman Dashboard dan Pengguna â€” Halaman login dengan Firebase Auth, dashboard anggota, scan QR absensi, halaman lencana, leaderboard, dan panel admin dengan manajemen berita, media, dan analytics.

---

### Sesi 1

Setup Dasar Monorepo â€” Next.js untuk frontend, NestJS untuk backend, Firestore dan Firebase Auth sebagai infrastruktur data awal. Modul error handling global dan sistem tema visual dibuat di sesi pertama ini.

---

### Rilis Sebelumnya

20 Mei 2026 â€” Integrasi materi dari guidebook resmi NEWGAME ke halaman landing. Semua ikon emoji di UI publik diganti dengan ikon SVG. Komponen landing dipecah menjadi lebih modular.

17 Mei 2026 â€” Migrasi dari sistem lama berbasis HTML/JS mandiri ke monorepo terpadu. Lebih dari 12.000 file konfigurasi lama dihapus. 16 modul backend dibuat untuk menangani kebutuhan sistem.

3 Mei 2026 â€” Halaman detail profil anggota dengan riwayat aktivitas. Kalender kegiatan interaktif. Banner pengumuman darurat untuk admin. Heatmap mingguan untuk analisis kehadiran.
