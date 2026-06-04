# LAPORAN PENGEMBANGAN PLATFORM NEWGAME V1.1
## UKM Game Development — Universitas Andalas
### Periode: Januari – Juni 2026

---

## IDENTITAS PROYEK

| Informasi | Detail |
|---|---|
| Nama Platform | NEWGAME V1.1 |
| Organisasi | UKM Game Development, Universitas Andalas |
| Repository | https://github.com/rannymphaea/web-ua-newgame |
| Portal Live | https://unandnewgame-tan.vercel.app |
| Tipe Proyek | Platform Web Internal Organisasi |
| Bahasa Utama | TypeScript (Frontend dan Backend) |
| Periode Pengerjaan | Januari – Juni 2026 |

---

## LATAR BELAKANG

NEWGAME adalah Unit Kegiatan Khusus (UKK) di bidang Game Development yang bernaung di bawah Universitas Andalas. Sebelum platform ini dikembangkan, pengelolaan keanggotaan, presensi, dan komunikasi internal dilakukan secara manual melalui spreadsheet dan grup WhatsApp. Hal ini menyebabkan data tidak terstruktur, sulit dilacak, dan tidak ada transparansi bagi anggota mengenai perkembangan mereka di dalam organisasi.

Platform NEWGAME V1.1 dibangun sebagai solusi digital terpadu yang menggantikan seluruh alur kerja manual tersebut dengan sistem yang terstruktur, aman, dan dapat diakses secara real-time oleh seluruh anggota aktif.

---

## TUJUAN PENGEMBANGAN

1. Menyediakan sistem keanggotaan digital dengan identitas unik (Member ID) untuk setiap anggota.
2. Mengotomasi pencatatan presensi berbasis QR code menggantikan absensi manual.
3. Membangun sistem gamifikasi berbasis XP (Experience Points) untuk mendorong partisipasi aktif anggota.
4. Menyediakan papan peringkat (leaderboard) yang transparan dan dapat diakses seluruh anggota.
5. Membangun kanal berita dan media internal yang terkelola dengan baik.
6. Menyediakan dasbor analitik bagi pengurus untuk memantau kondisi organisasi secara real-time.
7. Menerapkan standar keamanan modern pada seluruh lapisan sistem.

---

## ARSITEKTUR SISTEM

Platform dibangun menggunakan arsitektur monorepo dengan dua aplikasi utama yang berkomunikasi secara REST API.

### Komponen Utama

| Komponen | Teknologi | Fungsi |
|---|---|---|
| Backend API | NestJS 10, TypeScript | REST API, business logic, autentikasi, keamanan |
| Frontend Web | Next.js 14, App Router | Portal web anggota dan admin |
| Database Relasional | PostgreSQL (Neon Serverless) | Penyimpanan data utama terstruktur |
| Database Dokumen | Cloud Firestore (Firebase) | Legacy fallback dan dual-write backup |
| Cache | Upstash Redis (Serverless REST) | Rate limiting dan caching leaderboard |
| Autentikasi | Better Auth + Firebase Auth | Sesi pengguna, Google OAuth |
| Penyimpanan Media | Cloudinary | Upload dan optimasi gambar |
| Analytics | PostHog | Perekaman perilaku pengguna |
| Vector Database | Milvus / Zilliz Cloud | Pencarian semantik berbasis AI |
| CI/CD | GitHub Actions | Otomasi build, typecheck, security audit |
| Hosting | Vercel | Deployment frontend dan API serverless |

### Pola Dual-Write

Setiap operasi mutasi data penting ditulis ke dua tempat secara berurutan: PostgreSQL sebagai database primer, diikuti Firestore sebagai backup. Pola ini memastikan tidak ada kehilangan data apabila salah satu layanan mengalami gangguan sementara.

### Arsitektur Keamanan Berlapis

```
Internet
    |
Lapisan 1: WAF, TLS 1.3, HSTS, CSP
    |
Lapisan 2: Rate Limiting (Upstash Redis — 10 req/min auth, 100 req/min umum)
    |
Lapisan 3: Autentikasi (Better Auth session) + Otorisasi (NestJS RolesGuard)
    |
Lapisan 4: Parameterized Query (Prisma ORM — SQL Injection Prevention)
    |
Lapisan 5: Anomaly Detection + Forensic Logging
```

---

## MODUL BACKEND (21 Modul)

| No | Modul | Status | Fungsi |
|---|---|---|---|
| 1 | auth | Selesai | Registrasi, login, verifikasi member, role management |
| 2 | members | Selesai | CRUD anggota, import massal CSV/JSON |
| 3 | xp | Selesai | Kalkulasi XP, level, leaderboard dengan Redis caching |
| 4 | attendance | Selesai | Presensi QR, riwayat kehadiran |
| 5 | events | Selesai | Manajemen event dan tautan presensi |
| 6 | news | Selesai | Manajemen artikel, slug, status publish/draft |
| 7 | media | Selesai | Upload dan hapus media via Cloudinary |
| 8 | badges | Selesai | Definisi dan pemberian lencana ke anggota |
| 9 | notifications | Sebagian | Pembuatan dan pengiriman notifikasi |
| 10 | dashboard | Selesai | Agregasi data statistik untuk dasbor admin |
| 11 | users | Selesai | Profil pengguna dan manajemen akun |
| 12 | user-history | Selesai | Timeline aktivitas dan riwayat event per anggota |
| 13 | user-vault | Selesai | Penyimpanan data sensitif anggota |
| 14 | pillar-levels | Selesai | Level XP per pilar (Game Logic, Design, Sound) |
| 15 | logs | Selesai | Forensic activity log |
| 16 | export | Sebagian | Ekspor data ke format CSV |
| 17 | import | Selesai | Import anggota massal |
| 18 | leave | Direncanakan | Sistem pengajuan izin tidak hadir |
| 19 | ai | Sebagian | Vector embedding, pencarian semantik |
| 20 | anomalies | Sebagian | Isolation forest, anomaly scoring, evidence chain |
| 21 | cyber-defense | Sebagian | SIEM integration, PQCrypto placeholder |

---

## HALAMAN FRONTEND (12 Halaman)

| Halaman | Route | Status | Deskripsi |
|---|---|---|---|
| Landing Page | /landing | Selesai | Halaman publik, PirateMap, hero, CTA |
| Login / Daftar | /login | Selesai | Autentikasi email/Google, verifikasi member |
| Dashboard | /dashboard | Selesai | Beranda anggota, XP bar, stat cards |
| Leaderboard | /leaderboard | Selesai | Papan peringkat XP seluruh anggota |
| Lencana | /badges | Selesai | Koleksi lencana dan pencapaian |
| Presensi QR | /scan | Selesai | Scanner QR code kehadiran |
| Berita | /news | Selesai | Daftar dan detail artikel internal |
| Profil | /profile | Selesai | Profil anggota, avatar, riwayat aktivitas |
| Admin Panel | /admin | Sebagian | Manajemen anggota, berita, media, analytics |
| Direktori Anggota | /members | Sebagian | Daftar anggota dengan filter pilar |
| Kalender | /calendar | Sebagian | Tampilan jadwal event |
| Log Aktivitas | /logs | Sebagian | Riwayat log aktivitas sistem |

---

## DATA KEANGGOTAAN

Total anggota yang telah diregistrasi dalam sistem Firestore: 125 anggota

| Generasi | Pilar | Jumlah Anggota |
|---|---|---|
| GEN 1 | Game Logic | 46 orang |
| GEN 1 | Game Design | 25 orang |
| GEN 1 | Game Sound | 12 orang |
| GEN 2 | Game Design | 14 orang |
| GEN 2 | Game Logic | 23 orang |
| GEN 2 | Game Sound | 5 orang |
| Total | | 125 orang |

Distribusi status keanggotaan:

| Status | Keterangan |
|---|---|
| ACTIVE | Anggota aktif yang masih berpartisipasi |
| AFK | Anggota tidak aktif sementara |
| NPC | Peran non-playing character (pendukung) |
| GLORY | Alumni atau anggota kehormatan |
| RESIGN | Anggota yang telah keluar resmi |

---

## FITUR UNGGULAN

**Sistem Gamifikasi XP** — Setiap aktivitas anggota (kehadiran event, kontribusi proyek, pencapaian lencana) menghasilkan poin XP yang terakumulasi dan menentukan level anggota. Level divisualisasikan sebagai liquid wave bar di bagian atas halaman dasbor.

**Verifikasi Keanggotaan Dua Langkah** — Sebelum membuat akun, anggota wajib memasukkan Member ID dan Kode Akses sementara yang dihasilkan secara deterministik dari ID mereka. Kode hanya dapat digunakan satu kali dan divalidasi terhadap hash bcrypt yang tersimpan di Firestore.

**PirateMap Interaktif** — Visualisasi perjalanan anggota di NEWGAME ditampilkan sebagai diagram pohon SVG interaktif di landing page. Setiap simpul mewakili tahapan dalam roadmap anggota dan dapat diklik untuk melihat deskripsi detail.

**Web Mobile Simulator** — Alat internal untuk developer yang memungkinkan preview tampilan web di 9 preset ukuran layar perangkat (iPhone SE hingga iPad Air) langsung dari browser, tanpa membuka Chrome DevTools.

**Flutter Desktop Simulator** — Aplikasi desktop mandiri berbasis Flutter untuk preview live web frame secara real-time pada Windows, mendukung rotasi orientasi dan slider skala tampilan.

**Deteksi Anomali** — Modul keamanan aktif yang menganalisis pola request masuk menggunakan Isolation Forest. Pola tidak wajar (brute force, credential stuffing, enumeration) menghasilkan alert yang dicatat dalam forensic log.

---

## INFRASTRUKTUR DAN DEPLOYMENT

**Repository:** GitHub — rannymphaea/web-ua-newgame
**Platform Hosting:** Vercel (Frontend Next.js + API serverless proxy)
**Database:** Neon Serverless PostgreSQL (primary) + Google Firestore (fallback)
**Cache:** Upstash Redis (serverless REST, region Southeast Asia)
**Media CDN:** Cloudinary (upload, optimasi, dan distribusi gambar)
**CI/CD:** GitHub Actions — setiap push ke branch main menjalankan TypeScript typecheck, security audit npm, dan validasi kode

Pipeline CI/CD saat ini:
1. TypeScript strict type-check (zero any tolerance)
2. npm audit untuk deteksi dependensi dengan kerentanan
3. Lint check untuk konsistensi kode

---

## DOKUMENTASI YANG DIHASILKAN

| File | Isi |
|---|---|
| README.md | Ringkasan platform, setup manual, struktur monorepo |
| DEVELOPER_GUIDE.md | Standar kode, konvensi Git, pola dual-write |
| DOCS.md | Skema database, endpoint API, format respons, alur autentikasi |
| SECURITY.md | Arsitektur keamanan berlapis, Firestore rules, panduan kredensial aman |
| CHANGELOG.md | Riwayat pembaruan dari sesi 1 hingga V1.1 |
| ACCOUNT_GUIDE.md | Panduan registrasi untuk anggota baru |
| MEMBER_REGISTRATION.md | Panduan admin untuk menambahkan anggota baru |
| MEMBER_CREDENTIALS.md | Daftar lengkap 125 anggota beserta kode akses sementara |
| ANNOUNCEMENT.md | Pengumuman pembaruan platform untuk disebarkan ke anggota |
| TODO.md | Daftar tugas pengembangan dengan status terkini |
| LAPORAN.md | Dokumen ini — laporan resmi pengembangan platform |

---

## TANTANGAN DAN SOLUSI

**Masalah 1: Firebase Storage memerlukan upgrade berbayar**
Solusi: Migrasi seluruh layanan penyimpanan media ke Cloudinary menggunakan `upload_stream` berbasis readable stream Node.js. Upload foto profil dan cover artikel kini berjalan tanpa biaya tambahan.

**Masalah 2: FOUC (Flash of Unstyled Content) saat peralihan tema**
Solusi: Implementasi script inline di `<head>` pada root layout.tsx yang membaca preferensi tema dari `localStorage` dan menerapkan kelas `.dark` pada elemen html sebelum rendering pertama, sehingga peralihan tema terjadi tanpa kedipan.

**Masalah 3: Session restore lambat (1–3 detik blank screen)**
Solusi: Zustand auth store memanfaatkan IndexedDB Firebase yang menyimpan sesi secara lokal. Saat anggota membuka ulang aplikasi, status login diketahui secara sinkron tanpa menunggu respons jaringan.

**Masalah 4: Kebocoran API key ke log produksi**
Solusi: Ditemukan dan dihapus baris `console.log("GROQ KEY:", process.env.GROQ_API_KEY)` di file providers.ts. Diganti dengan pengecekan panjang karakter yang aman: `logger.log('GROQ_API_KEY loaded: ${key?.length} chars')`.

**Masalah 5: Deployment Vercel gagal karena konfigurasi vercel.json yang salah**
Solusi: Rewrite API di next.config.js dibatasi hanya aktif saat development. Hostname Cloudinary ditambahkan ke daftar `remotePatterns` Next.js untuk optimasi gambar. File vercel.json diperbaiki sehingga route API dan frontend berjalan tanpa konflik.

---

## RENCANA PENGEMBANGAN SELANJUTNYA

| Fitur | Prioritas | Estimasi |
|---|---|---|
| Password reset melalui email | Tinggi | 1 minggu |
| Notifikasi push real-time (WebSocket) | Tinggi | 2 minggu |
| Ekspor laporan presensi ke PDF/CSV | Sedang | 1 minggu |
| Pencarian semantik artikel berbasis AI | Sedang | 2 minggu |
| Sistem pengajuan izin tidak hadir | Sedang | 1 minggu |
| Two-factor authentication (2FA) untuk admin | Tinggi | 2 minggu |
| Internasionalisasi (Bahasa Indonesia / Inggris) | Rendah | 3 minggu |
| Docker Compose untuk development lokal | Rendah | 1 minggu |
| Ekspor leaderboard sebagai gambar | Rendah | 3 hari |

---

## PEMBARUAN V1.2 — 5 JUNI 2026

### PART 1 — Landing Page dan PirateMap Flowchart

Teks hero kini bersiklus empat frasa: NEWGAME, LEARN CRATE, PLAY WIN, LEVEL UP. Setiap frasa punya gradient warna unik, glitch chromatic flash saat transisi, dan 8 partikel radial burst. PirateMap ditulis ulang menjadi flowchart vertikal Framer Motion dengan spring bounce per node, draw-stroke konektor, star burst Soldat, tooltip hover, dan mobile slide-in cards.

### PART 2 — Fix Redirect Login ke Dashboard

Bug post-login redirect ke landing diselesaikan dengan debounce 1.2 hingga 2.5 detik di dashboard layout dan sessionStorage flag ng-just-logged-in. Root page Firebase timeout diperpanjang dari 600ms ke 1500ms. Target redirect diubah ke slash login.

### PART 3 — IdleSessionManager dan CI Fix

IdleSessionManager baru: auto-logout 30 menit idle, warning dialog 2 menit sebelum logout dengan SVG countdown ring animasi gold ke merah, tracking 6 jenis event via AbortController, dan penanganan tab visibility change. CI fix mengganti npm ci dengan npm install legacy-peer-deps, membuat eslintrc.json agar lint tidak interaktif, dan meregenerasi package-lock.json.

| Item | Status |
|---|---|
| Commit terakhir | 04f67c1 di branch main |
| Portal Live | https://unandnewgame-tan.vercel.app |
| CI/CD | Fixed, diharapkan hijau mulai run 55 ke atas |

---

## PENUTUP

Platform NEWGAME V1.2 telah diperbarui dengan perbaikan kritis pada UX, keamanan sesi, dan stabilitas pipeline CI/CD. Sistem mencakup 21 modul backend, 12 halaman frontend, serta 5 lapisan keamanan. Platform dirancang modular sehingga fitur baru dapat ditambahkan secara bertahap tanpa mengganggu yang sudah berjalan.

---

*Laporan disiapkan oleh tim pengembang NEWGAME. UKM Game Development, Universitas Andalas. Juni 2026.*
