# NEWGAME — Platform Komunitas Game Development

<div align="center">
  <img src="apps/web/public/logo.png" alt="NEWGAME Logo" width="80" />

  **Portal resmi UKM Game Development Universitas Andalas**

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
  [![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com)
  [![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase)](https://firebase.google.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
</div>

---

## Tentang Platform

NEWGAME adalah platform web internal untuk komunitas game developer mahasiswa Universitas Andalas. Sistem ini dirancang untuk menggantikan pencatatan manual kehadiran dan penilaian anggota dengan sistem gamifikasi — mirip seperti bermain RPG, tapi versi organisasi kampus.

Anggota yang aktif mengerjakan task, hadir di rapat, dan berkontribusi pada proyek akan mendapatkan **XP (Experience Points)**, naik level, dan mendapat badge khusus. Siapa yang paling aktif akan tampil di leaderboard.

---

## Fitur Utama

### Untuk Anggota
- **Absensi QR Code** — Scan QR di setiap kegiatan untuk mencatat kehadiran
- **Profil & Level** — Lihat progress XP, level, dan riwayat kehadiran
- **Leaderboard** — Peringkat anggota berdasarkan total XP
- **Badge Collection** — Koleksi lencana dari pencapaian tertentu
- **Berita & Tutorial** — Konten edukasi seputar game development
- **Kalender Event** — Jadwal kegiatan mendatang

### Untuk Admin
- **Manajemen Berita** — Buat, edit, dan publish artikel
- **Media Gallery** — Upload dan kelola aset media
- **Kelola Anggota** — Lihat data semua member, edit peran
- **System Logs** — Pantau aktivitas sistem
- **Analytics** — Statistik keaktifan dan pertumbuhan komunitas

### Halaman Publik
- **Landing Page** — Profil organisasi: visi misi, struktur, pillar, quest, sistem EXP
- **Guidebook Interaktif** — Panduan lengkap di [2b-eternity.github.io/test](https://2b-eternity.github.io/test/)

---

## Cara Menjalankan

### Prasyarat
- Node.js 18 atau lebih baru
- npm 9+
- Akun Firebase dengan project yang sudah dibuat

### 1. Clone & Install
```bash
git clone https://github.com/rannymphaea/web-ua-newgame.git
cd web-ua-newgame
npm install --legacy-peer-deps
```

### 2. Konfigurasi Environment

Buat file `apps/web/.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Buat file `apps/api/.env`:
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
JWT_SECRET=your_jwt_secret_min_32_chars
PORT=3001
```

Letakkan file `serviceAccountKey.json` di root proyek (minta dari admin tim).

### 3. Jalankan
```bash
npm run dev           # Frontend + Backend bersamaan
npm run dev:web       # Frontend saja (port 3000)
npm run dev:api       # Backend saja  (port 3001)
```

---

## Struktur Proyek

```
web-ua-newgame/
├── apps/
│   ├── web/                        Next.js frontend (port 3000)
│   │   ├── public/                 Aset statis: logo, karakter OC
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx      Root layout
│   │       │   ├── page.tsx        Root redirect
│   │       │   ├── login/          Halaman login
│   │       │   ├── landing/        Landing page publik
│   │       │   └── (dashboard)/    Halaman dashboard (auth-guarded)
│   │       │       ├── layout.tsx  Auth guard + sidebar + topbar
│   │       │       ├── dashboard/  Halaman utama
│   │       │       ├── scan/       Scan QR absensi
│   │       │       ├── news/       Berita & tutorial
│   │       │       ├── leaderboard/
│   │       │       ├── badges/
│   │       │       ├── profile/
│   │       │       ├── members/
│   │       │       ├── logs/
│   │       │       ├── calendar/
│   │       │       └── admin/      Panel admin (role-gated)
│   │       ├── components/
│   │       │   ├── layout/         Sidebar, TopBar
│   │       │   └── ui/             Toast, Cursor, Banner, ErrorBoundary
│   │       ├── lib/
│   │       │   ├── auth-store.ts   Zustand auth state
│   │       │   ├── firebase.ts     Firebase config
│   │       │   ├── api.ts          HTTP client
│   │       │   └── theme-engine.ts Dark/light mode
│   │       └── styles/
│   │           └── globals.css     Design system lengkap
│   └── api/                        NestJS backend (port 3001)
│       └── src/
│           ├── app.module.ts       Daftar 16 modul
│           ├── firebase/           Koneksi Firebase Admin SDK
│           ├── common/             Guards, decorators, middleware
│           └── modules/            auth, users, attendance, events,
│                                   members, xp, leave, logs, anomalies,
│                                   news, media, badges, pillar-levels,
│                                   notifications, export, import
├── security/                       Konfigurasi NGINX, ModSecurity, stubs
├── DEVELOPER_GUIDE.md              Panduan developer, kontribusi, style guide, dan troubleshooting
├── SECURITY.md                     Panduan keamanan, rules, hardening, threat intel, dan checklist
├── CHANGELOG.md                    Log perubahan dan pelacakan sesi
└── package.json                    Konfigurasi monorepo workspaces
```

---

## Alur Kerja Sistem

### Login dan Akses
```
Pengguna buka website
        |
        v
  Sudah login? ----TIDAK----> Halaman Login
        |                          |
       YA                    Firebase Auth verify
        |                          |
        v                          v
  Cek role user            Cek di Firestore: ada data user?
        |                    YA: masuk dashboard
        |                    TIDAK: tampilkan error
        v
  member  --> Dashboard, Scan, News, Leaderboard, Badges, Profile
  admin   --> Semua fitur member + Admin Panel, Analytics, Members, Logs
```

### Scan QR (Absensi)
```
Admin buat Event --> Generate QR (token 12 detik)
        |
Member buka /scan --> Kamera aktif --> Scan QR
        |
Backend cek: token valid? event aktif? belum absen? device sama?
        |
   SEMUA OK --> Attendance dicatat, XP ditambah, Streak dihitung
```

---

## Koleksi Database (Firestore)

| Koleksi | Isi | Digunakan oleh |
|---------|-----|----------------|
| users | Akun: nama, email, role, XP, foto profil, activeAvatar | Auth, Dashboard, Leaderboard |
| events | Kegiatan: nama, tanggal, XP reward | Admin Panel, Attendance |
| attendance | Riwayat kehadiran | Scan QR, Dashboard |
| tokens | Token QR sementara (12 detik) | Scan QR |
| members | Data anggota: ID, pillar, generasi | Members Directory |
| news | Berita, blog, event, tutorial | News, Dashboard Slider |
| media | File yang di-upload | Media Gallery |
| logs | Catatan aktivitas sistem | System Logs |
| anomalies | Deteksi kecurangan | Backend otomatis |
| leave | Permintaan izin | Leave module |
| xp_history | Riwayat perubahan XP | XP module |
| user_badges | Lencana per user | Badges module |
| user_pillar_levels | Level pilar per user | Pillar module |
| announcements | Banner pengumuman | Dashboard |

---

## Sistem Gamifikasi

### Cara Kerja XP
- Setiap kehadiran, task selesai, atau kontribusi memberikan XP
- **Level** = `Math.floor(totalXP / 100) + 1`
- Progress level ditampilkan sebagai liquid bar animasi di topbar
- Setiap 100 XP naik 1 level

### Sistem Rank
| Rank | Keterangan |
|------|------------|
| Novice | Anggota baru |
| Apprentice | Mulai aktif |
| Knight | Anggota tetap |
| Champion | Sangat aktif |
| Legend | Kontribusi luar biasa |

---

## Teknologi

| Lapisan | Teknologi | Versi |
|---------|-----------|-------|
| Frontend | Next.js (App Router) | 14.2 |
| Styling | Vanilla CSS | - |
| State | Zustand | 4.5 |
| Animasi | Framer Motion | 11 |
| Backend | NestJS | 10 |
| Database | Firebase Firestore | - |
| Auth | Firebase Auth | - |
| Storage | Firebase Storage | - |
| QR Scanner | html5-qrcode | 2.3 |
| Charts | Recharts | 2.12 |
| Icons | Remix Icon | 4.5 |

---

## Desain Sistem

### Warna Utama
```css
--clr-gold:           #FDCF41   /* Aksen utama */
--clr-bg:             #0D1117   /* Background gelap */
--clr-bg-secondary:   #161B22   /* Card background */
--clr-text-primary:   #E6EDF3   /* Teks utama */
--clr-text-secondary: #8B949E   /* Teks sekunder */
```

### Tipografi
- **Inter** — UI umum, tombol, label
- **Lora** — Heading, judul section
- **Cormorant Garamond** — Teks panjang (landing page saja)
- **Pinyon Script** — Dekoratif (landing page saja)

---

## Keputusan Desain Penting

- **Monorepo** dipilih untuk kemudahan berbagi tipe antara `apps/web` dan `apps/api`
- **Optimistic auth** — `auth.currentUser` digunakan sinkronus (dari IndexedDB cache Firebase) agar dashboard muncul instan tanpa spinner
- **Remix Icon non-blocking** — dimuat dengan trik `media="print"` agar tidak menunda render pertama
- **Font scope** — Cormorant & Pinyon hanya dimuat di `/landing`, menghemat ~80KB per halaman dashboard
- **Two-phase dashboard** — Hero konten (nama, XP) dari Zustand, stat cards menyusul ~50ms, news/leaderboard defer setelah paint

---

## Catatan Teknis

1. `userData` tidak mengandung `uid` — gunakan `user.uid` dari Firebase Auth untuk lookup Firestore
2. `auth.currentUser` tersedia sinkronus setelah Firebase init (dari IndexedDB cache)
3. Cormorant Garamond & Pinyon Script hanya di `/landing` — jangan tambahkan ke global layout
4. Jangan gunakan `window.location.href` untuk redirect — selalu pakai `router.replace()`
5. Gunakan `next/dynamic` + `ssr: false` untuk komponen berat yang tidak perlu SSR

---

## Deployment

### Frontend ke Vercel
Deployment saat ini ditahan. File `apps/web/vercel.json` berisi `ignoreCommand: exit 0` yang mencegah build otomatis. Saat siap rilis:
1. Hapus `apps/web/vercel.json`
2. Isi semua environment variables di Vercel Dashboard
3. Set root directory ke `apps/web`
4. Push ke GitHub

### Backend ke Server
1. Root directory: `apps/api`
2. Set `PORT`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`
3. Setelah deploy, perbarui `FRONTEND_URL` di `apps/api/src/main.ts`

---

## Status Pengembangan dan Todo List

### Status Persiapan Awal
Tahap persiapan dasar sistem telah selesai dilakukan: konfigurasi Firebase Service Account Key, pengisian data awal anggota melalui script seed, dan verifikasi fungsionalitas login. Sistem backend dan frontend saat ini dapat berjalan secara normal di lingkungan lokal.

### Pengujian Sebelum Peluncuran
- **Alur Absensi QR**: Pengujian dilakukan dengan login menggunakan akun admin, membuat event baru melalui halaman /admin, kemudian memindai kode QR yang dihasilkan dari perangkat berbeda menggunakan halaman /scan. Setelah pemintaian berhasil, pastikan poin XP bertambah pada profil anggota yang memindai.
- **Alur Publikasi Konten**: Login menggunakan akun admin, akses halaman /admin/news, buat publikasi baru dengan menyertakan URL YouTube yang valid, kemudian verifikasi tampilan konten tersebut muncul dengan benar pada halaman /news di tab Tutorial.
- **Indeks Firestore**: Beberapa kueri yang menggabungkan lebih dari satu kondisi filter memerlukan composite index di Firestore. Indeks ini tidak perlu dibuat secara manual di awal. Pada saat error pertama kali muncul, Firebase akan memberikan tautan langsung ke halaman pembuatan indeks di Console. Klik tautan tersebut dan indeks akan dibuat otomatis.

### Konten yang Perlu Disesuaikan
- **Logo Organisasi**: File apps/web/public/logo.png saat ini menggunakan file sementara. Ganti dengan logo resmi NEWGAME dalam format PNG transparan dengan dimensi minimal 256x256 piksel.
- **Logo Divisi**: Setiap pilar memiliki field logo di dalam objek array PILLARS pada file apps/api/src/modules/pillar-levels/pillar-definitions.ts. Diperlukan tiga berkas gambar untuk pilar Game Logic, Game Design, dan Game Sound. Format PNG atau SVG disarankan.
- **Nama Resmi Jabatan Pengurus Inti**: Objek MAIN_CORE di dalam apps/web/src/app/landing/components/data.ts saat ini menggunakan nama peran generik seperti "Pixel President" dan "Code Commander". Isi dengan nama asli pemegang jabatan.
- **Banner Pengumuman**: Objek FALLBACK_ANNOUNCEMENT di apps/web/src/components/ui/AnnouncementBanner.tsx perlu diisi dengan konten pengumuman yang relevan untuk ditampilkan kepada anggota di halaman dashboard.
- **Angka Statistik Landing Page**: Array STATS di apps/web/src/app/landing/components/data.ts berisi angka statistik yang ditampilkan di halaman publik. Sesuaikan nilai value dan suffix dengan data organisasi yang sesungguhnya.
- **Persyaratan Kenaikan Level Pilar**: Field persyaratan (requirements) untuk naik dari satu level ke level berikutnya di apps/api/src/modules/pillar-levels/pillar-definitions.ts masih menggunakan teks cadangan. Isi dengan ketentuan yang ditetapkan oleh pengurus.

---

## Guidebook

Panduan lengkap NEWGAME: **[https://2b-eternity.github.io/test/](https://2b-eternity.github.io/test/)**

Berisi: struktur organisasi, sistem EXP, divisi (quest), 3 pillar, profil Main Core, FAQ.

---

## Lisensi

Internal use only — NEWGAME UKM Universitas Andalas © 2026

---

<div align="center">
  <strong>Learn · Create · Play</strong><br/>
  <em>NEWGAME — Universitas Andalas</em>
</div>