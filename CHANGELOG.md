# Riwayat Pembaruan — NEWGAME

Catatan lengkap perjalanan pengembangan platform NEWGAME UKM Game Development Universitas Andalas. Entri diurutkan dari yang paling baru.

---

### V1.1 — Juni 2026

Rilis ini merupakan perombakan total arsitektur data, pengerasan keamanan sistem, optimasi performa backend dan frontend secara menyeluruh, serta penambahan alat simulator untuk kenyamanan developer.

#### Arsitektur dan Database

Prisma dan PostgreSQL — Migrasi sistem database utama dari Firestore-centric ke arsitektur relasional menggunakan PostgreSQL (Neon Serverless). Skema mencakup 9 model utama: User, UserProfile, Session, NewsArticle, Event, Attendance, XpHistory, Activity, dan Notification.

Better Auth — Integrasi Better Auth dengan Prisma adapter untuk mengelola sesi pengguna secara mandiri di database relasional. Mendukung login Email/Password dan Google OAuth.

Upstash Redis — Pemasangan global RedisModule berbasis Upstash Redis REST SDK untuk caching leaderboard, cache profil pengguna, dan penanganan rate limiting.

Milvus Vector DB — Penyediaan VectorService berbasis Milvus SDK Node untuk pencarian semantik dan pencarian berita terkait menggunakan text embedding OpenAI.

#### Keamanan dan Kualitas Kode

Global Response Interceptor — Pembuatan ResponseInterceptor NestJS untuk menstandardisasi semua HTTP Response ke format terpadu `{ success, data, meta, timestamp }`.

Global Exception Filter — Pendaftaran AllExceptionsFilter secara global di `main.ts` untuk logging forensik dan penyusunan respons error yang seragam.

Perbaikan Kebocoran Kunci — Penghapusan baris `console.log("GROQ KEY:", ...)` pada `providers.ts` yang berpotensi mengekspos API key ke log produksi. Diganti dengan pengecekan panjang karakter yang aman.

Supresi CSS Warning — Penambahan pengecualian aturan `@theme` Tailwind CSS v4 di `.vscode/settings.json` agar tidak memunculkan false-positive warning di IDE.

#### Alat Developer dan Tampilan

Web Mobile Simulator — Pembuatan halaman simulator di route `/dev-tools`, dilengkapi 8 preset perangkat, toggle portrait/landscape, quick navigation links, dan slider skala tampilan.

Flutter Desktop Simulator — Aplikasi simulator eksternal berbasis Flutter Desktop di `tools/mobile-simulator/` untuk preview live web frame secara real-time.

PirateMap Interaktif — Penulisan ulang komponen PirateMap.tsx dengan visualisasi pohon diagram interaktif, animasi stroke SVG, junction nodes, dan panel deskripsi saat hover.

PostHog Analytics — Integrasi PostHog provider di frontend untuk perekaman demografi dan pelacakan event interaksi pengguna secara real-time.

---

### 29 Mei 2026

Migrasi Storage ke Cloudinary — Firebase Storage memerlukan upgrade berbayar sehingga layanan dipindah ke Cloudinary. Media service di backend ditulis ulang sepenuhnya menggunakan `cloudinary.uploader.upload_stream` via readable stream.

Perbaikan Upload Foto Profil — Error `unknown_system_error` yang sudah lama muncul diselesaikan. Akar masalahnya: `makePublic()` selalu gagal karena Firebase Storage belum diaktifkan, dan error aslinya tidak pernah mencapai frontend karena tertimpa pesan generik.

Interaksi Karakter Yua di Dashboard — Gambar Yua di hero section sekarang dapat diklik. Klik memicu animasi bounce dalam 400ms dan memutar `yua-select.mp3`. SFX memiliki cooldown 600ms untuk mencegah spam.

Tampilan Avatar Yua di Halaman Profil — Tombol pilih avatar Yua menampilkan gambar karakter secara langsung. Badge "NEW" dihapus. Warna aksen Yua diubah ke biru (`#3b82f6`).

Konsolidasi Dokumentasi — Semua file `.md` yang terpencar digabungkan dan distandarisasi menjadi satu set dokumen terpadu.

Perbaikan Deploy Vercel — `vercel.json` yang sebelumnya memblokir deployment diperbaiki. Rewrite API di `next.config.js` sekarang hanya aktif saat development. Hostname Cloudinary ditambahkan ke `remotePatterns` untuk optimasi gambar.

---

### Sesi 7

Integrasi Guidebook — Penambahan kartu Guidebook di dashboard dan landing page. Di landing, terdapat seksi baru sebelum CTA dengan animasi Framer Motion.

---

### Sesi 6

Optimasi Performa — Auth store memanfaatkan cache IndexedDB Firebase agar status login dimuat instan. Dashboard menggunakan dua fase — fase pertama menampilkan data dari Zustand cache, fase kedua mengambil data terbaru dari server. CSS Remix Icon dimuat secara async dan font Cormorant dihapus dari dashboard untuk menghemat bundle size.

---

### Sesi 5

XP Liquid Bar di TopBar — Bar XP setinggi 30px ditambahkan secara horizontal di bagian atas halaman. Animasi gelombang SVG dan warna berubah otomatis sesuai level pengguna.

---

### Sesi 4

Pengerasan Keamanan — SecurityModule NestJS dibuat berisi rate limiting, validasi JWT, CORS, Helmet, dan filter input. Fondasi anomaly detection dan forensic logging dipasang di sesi ini.

---

### Sesi 3

Landing Page Premium — Desain ulang total landing page. Animasi typewriter di hero, seksi visi misi, struktur pengurus, dan pengenalan pilar. Pirate Map untuk perjalanan anggota dan efek suara interaktif.

---

### Sesi 2

Halaman Dashboard dan Pengguna — Halaman login dengan Firebase Auth, dashboard anggota, scan QR absensi, halaman lencana, leaderboard, dan panel admin dengan manajemen berita, media, dan analytics.

---

### Sesi 1

Setup Dasar Monorepo — Next.js untuk frontend, NestJS untuk backend, Firestore dan Firebase Auth sebagai infrastruktur data awal. Modul error handling global dan sistem tema visual dibuat di sesi pertama ini.

---

### Rilis Sebelumnya

20 Mei 2026 — Integrasi materi dari guidebook resmi NEWGAME ke halaman landing. Semua ikon emoji di UI publik diganti dengan ikon SVG. Komponen landing dipecah menjadi lebih modular.

17 Mei 2026 — Migrasi dari sistem lama berbasis HTML/JS mandiri ke monorepo terpadu. Lebih dari 12.000 file konfigurasi lama dihapus. 16 modul backend dibuat untuk menangani kebutuhan sistem.

3 Mei 2026 — Halaman detail profil anggota dengan riwayat aktivitas. Kalender kegiatan interaktif. Banner pengumuman darurat untuk admin. Heatmap mingguan untuk analisis kehadiran.
