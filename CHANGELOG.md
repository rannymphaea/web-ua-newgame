# Riwayat Perubahan (Changelog) NEWGAME

Catatan komprehensif perjalanan pengembangan dan pembaruan platform NEWGAME UKM Game Development Universitas Andalas. Pembaruan diurutkan dari yang paling baru.

---

## 🚀 Juni 2026 — Rilis Besar Arsitektur V2

Rilis besar ini berfokus pada perombakan total arsitektur data, pengerasan sistem keamanan, optimasi performa backend & frontend secara signifikan, serta penambahan kakas (tools) simulator untuk mendukung kenyamanan developer.

### 💾 Pembaruan Arsitektur & Database
- **Prisma & PostgreSQL**: Mengimigrasi sistem database utama dari Firestore-centric ke arsitektur relasional menggunakan PostgreSQL (Neon Serverless). Skema mencakup 9 model utama: `User`, `UserProfile`, `Session`, `NewsArticle`, `Event`, `Attendance`, `XpHistory`, `Activity`, dan `Notification`.
- **Better Auth Integration**: Mengintegrasikan `Better Auth` dengan Prisma adapter untuk mengelola manajemen sesi pengguna secara mandiri di database relasional, mendukung login tradisional Email/Password dan Google OAuth.
- **Upstash Redis Caching**: Memasang global `RedisModule` NestJS berbasis Upstash Redis REST SDK. Digunakan untuk caching leaderboard (`leaderboard:all`), profile cache, dan penanganan rate limiting.
- **Milvus Vector DB Module**: Menyediakan `VectorService` berbasis Milvus SDK Node untuk mendukung fitur pencarian semantik cerdas (AI) dan pencarian berita terkait secara instan menggunakan text embedding OpenAI.

### 🛡️ Keamanan & Kualitas Kode
- **Global Interceptor & Response Standardizer**: Membuat `ResponseInterceptor` NestJS untuk menstandardisasi semua keluaran HTTP Response ke format terpadu `{ success, data, meta, timestamp }` secara otomatis.
- **Global Exceptions Filter**: Mendaftarkan `AllExceptionsFilter` secara global di `main.ts` untuk menangani logging error forensik dan menyusun respons kegagalan API agar seragam.
- **Mitigasi Kebocoran Kunci (Security Fix)**: Menghapus baris cetak log sensitif `console.log("GROQ KEY:", ...)` pada file `providers.ts` yang berpotensi mengekspos API key rahasia ke sistem log produksi. Diganti dengan logging safe check length.
- **Supresi CSS Warning**: Menambahkan pengecualian aturan `@theme` Tailwind CSS v4 di VS Code (`.vscode/settings.json`) dan linter CSS (`globals.css`) agar tidak memunculkan false-positive warnings pada IDE.

### 📱 Kakas Pengembangan & Visual (UI/UX)
- **Web Mobile Simulator**: Membuat halaman simulator interaktif khusus developer di `/dev-tools` Next.js, dilengkapi dengan 8 preset device, portrait/landscape toggle, quick navigation links, dan scale slider.
- **Flutter Desktop Simulator App**: Membuat program simulator eksternal berbasis Flutter Desktop pada direktori `tools/mobile-simulator/` untuk memfasilitasi preview live web frame real-time.
- **Interactive PirateMap**: Menulis ulang komponen `PirateMap.tsx` dengan visualisasi peta informasi interaktif terpadu berbentuk pohon diagram (left-to-right tree), animasi stroke-dashoffset SVG konektor, junction nodes, dan panel deskripsi instan saat hover.
- **PostHog Analytics Integration**: Mengintegrasikan PostHog provider di frontend Next.js untuk mengotomatisasi perekaman data demografi dan pelacakan event interaksi user secara real-time.

---

## 29 Mei 2026

**Migrasi storage ke Cloudinary**
Firebase Storage sekarang butuh upgrade berbayar, jadi kita pindah ke Cloudinary yang gratis dan tidak perlu kartu kredit. Media service di backend ditulis ulang sepenuhnya — semua upload sekarang pakai `cloudinary.uploader.upload_stream` via readable stream, bukan lagi `file.save()` ke Firebase bucket. Fungsi hapus file juga diperbarui agar bisa parsing public ID dari URL Cloudinary.

**Perbaikan upload foto profil**
Error `unknown_system_error` yang sudah lama mengganggu akhirnya terselesaikan. Akar masalahnya ada di dua hal: pertama, `makePublic()` selalu gagal karena Firebase Storage belum pernah diaktifkan; kedua, error aslinya tidak pernah sampai ke frontend karena selalu ditimpa dengan pesan generik. Sekarang kedua hal itu sudah diperbaiki.

**Interaksi karakter Yua di dashboard**
Gambar Yua di hero section sekarang bisa diklik. Klik memicu animasi bounce (scale + rotate kecil dalam 400ms) dan memutar `yua-select.mp3`. SFX punya cooldown 600ms supaya tidak spam, tapi animasinya tetap jalan setiap klik.

**Tampilan avatar Yua di halaman profil**
Tombol pilih avatar Yua sekarang menampilkan gambar karakter Yua langsung, bukan huruf inisial. Kalau avatar aktif adalah Yua dan tidak ada foto profil yang diupload, foto profil utama juga menampilkan gambar Yua. Badge "NEW" sudah dihapus. Warna aksen Yua diganti ke biru (`#3b82f6`).

**Konsolidasi dokumentasi**
Semua file `.md` yang berserakan digabungkan jadi empat file saja: README, DEVELOPER_GUIDE, SECURITY, dan CHANGELOG ini. Semua emoji dihapus dari dokumentasi.

**Perbaikan deploy Vercel**
`vercel.json` di `apps/web` yang sebelumnya sengaja memblokir deployment (`ignoreCommand: exit 0`) sudah dibenarkan. Root `vercel.json` dibuat ulang dengan konfigurasi yang benar untuk monorepo. Rewrite API di `next.config.js` sekarang hanya aktif saat development — di production, traffic langsung ke `NEXT_PUBLIC_API_URL`. Hostname Cloudinary ditambahkan ke `remotePatterns` untuk image optimization.

---

## Sesi 7

**Integrasi Guidebook**
Menambahkan kartu Guidebook di dashboard dan halaman landing. Di landing, ada seksi baru sebelum CTA dengan animasi Framer Motion. Di hero, ada tombol ketiga untuk scroll otomatis ke bagian panduan.

---

## Sesi 6

**Optimasi performa**
Masalahnya waktu itu: halaman pertama butuh 3+ detik untuk tampil, spinner login bertahan 1-3 detik, dan font berat dimuat di semua halaman dashboard.

Solusinya: auth store sekarang memanfaatkan cache IndexedDB Firebase sehingga status login dimuat instan. Dashboard punya dua fase — fase pertama tampilkan data dari Zustand cache, fase kedua baru ambil data dari server. CSS Remix Icon dimuat secara async dan font Cormorant dihapus dari dashboard untuk menghemat bundle size.

---

## Sesi 5

**XP liquid bar di TopBar**
Bar XP setinggi 30px ditambahkan secara horizontal di bagian atas. Ada animasi gelombang SVG dan warna berubah otomatis sesuai level user. Dashboard dikembalikan ke desain dengan ilustrasi karakter.

---

## Sesi 4

**Pengerasan keamanan**
SecurityModule NestJS dibuat — berisi rate limiting, validasi JWT, CORS, Helmet, dan filter input. Konfigurasi NGINX dan ModSecurity WAF dibuat sebagai stub. Fondasi awal anomaly detection dan forensic logging juga dipasang di sesi ini.

---

## Sesi 3

**Landing page premium**
Desain ulang total landing page. Animasi typewriter di hero, seksi visi misi, struktur pengurus, dan pengenalan pilar. Ada juga Pirate Map untuk journey anggota, efek suara interaktif, dan modal video profil organisasi.

---

## Sesi 2

**Halaman dashboard dan pengguna**
Halaman login dengan Firebase Auth, dashboard anggota, scan QR absensi, halaman lencana, leaderboard, dan panel admin dengan manajemen berita, media, dan analytics.

---

## Sesi 1

**Setup dasar monorepo**
Next.js untuk frontend, NestJS untuk backend, Firestore dan Firebase Auth sebagai infrastruktur data. Modul error handling global dan sistem tema visual dibuat di sesi pertama ini.

---

## Rilis sebelumnya

**20 Mei 2026** — Integrasi materi dari guidebook resmi NEWGAME ke halaman landing. Semua emoji di UI publik diganti dengan ikon SVG. Komponen landing dipecah jadi lebih modular.

**17 Mei 2026** — Migrasi dari sistem lama berbasis HTML/JS mandiri ke monorepo terpadu. Lebih dari 12.000 file konfigurasi lama dihapus. 16 modul backend dibuat untuk menangani seluruh kebutuhan sistem.

**3 Mei 2026** — Halaman detail profil anggota dengan riwayat aktivitas. Kalender kegiatan interaktif. Banner pengumuman darurat untuk admin. Heatmap mingguan untuk analisis kehadiran.
