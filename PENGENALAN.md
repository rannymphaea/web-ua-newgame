# Pengenalan Codebase NEWGAME

Dokumen ini menjelaskan isi, alur kerja, dan lokasi setiap bagian dari website NEWGAME.
Dibuat agar developer baru bisa langsung paham tanpa harus membaca satu per satu file.

---

## Cara Kerja Website (Flowchart)

### Alur Login dan Akses

```
Pengguna buka website
        |
        v
  Sudah login? ----TIDAK----> Halaman Login
        |                         |
       YA                    Pilih metode:
        |                    Email atau Google
        v                         |
  Cek role user                   v
        |                  Firebase Auth verify
        |                         |
        v                         v
  +-- member --+          Cek di Firestore:
  |            |          apakah ada data user?
  |  Dashboard |                  |
  |  Scan QR   |          YA: masuk dashboard
  |  News      |          TIDAK: tampilkan error
  |  Leaderboard
  |  Profile   |
  |            |
  +-- admin ---+
  |            |
  |  Semua fitur member
  |  + Admin Panel
  |  + Kelola News
  |  + Media Gallery
  |  + Members
  |  + System Logs
  +-----------+
```

### Alur Scan QR (Absensi)

```
Admin buat Event di /admin
        |
        v
Admin klik "Generate QR"
        |
        v
Sistem buat token unik
(berlaku 12 detik)
        |
        v
QR code tampil di layar admin
        |
        v
Member buka /scan
        |
        v
Kamera aktif, scan QR
        |
        v
Token dikirim ke backend
        |
        v
Backend cek:
1. Token masih valid?
2. Event masih aktif?
3. Member belum absen di event ini?
4. Device ID sama dengan sebelumnya?
        |
    SEMUA OK
        |
        v
Attendance dicatat di Firestore
XP ditambahkan ke member
Streak dihitung
        |
        v
Tampil: "Berhasil! +10 XP"
```

### Alur News dan Tutorial

```
Admin buka /admin/news
        |
        v
Klik "Buat Post Baru"
        |
        v
Pilih kategori:
- News (berita umum)
- Blog (artikel)
- Event (pengumuman kegiatan)
- Tutorial (materi belajar)
        |
        v
Jika Tutorial:
  - Pilih sub: Game Logic / Game Design / Game Sound
  - Paste YouTube URL (opsional)
        |
        v
Simpan ke Firestore
        |
        v
Tampil di:
  - /news (semua post)
  - /dashboard slider (jika ditandai featured)
```

---

## Lokasi File dan Penjelasan

### Backend (apps/api/src/)

Backend adalah server yang menangani semua logika, database, dan keamanan.

```
apps/api/src/
│
├── main.ts
│   Server dimulai dari sini.
│   Setup CORS, prefix /api, port 3001.
│
├── app.module.ts
│   Daftar semua module yang dipakai.
│   Jika tambah fitur baru, import module-nya di sini.
│
├── firebase/
│   ├── firebase.service.ts   -- Koneksi ke Firestore, Auth, Storage
│   └── firebase.module.ts    -- Provider supaya bisa dipakai module lain
│
├── common/
│   ├── guards/
│   │   ├── firebase-auth.guard.ts  -- Cek apakah user sudah login
│   │   └── roles.guard.ts          -- Cek apakah user punya akses (admin/member)
│   └── decorators/
│       ├── roles.decorator.ts      -- Tandai endpoint butuh role tertentu
│       └── current-user.decorator.ts -- Ambil data user yang sedang login
│
└── modules/
    │
    ├── auth/
    │   ├── auth.controller.ts  -- Endpoint: POST /api/auth/register
    │   └── auth.service.ts     -- Logika: verifikasi member ID, buat akun
    │
    ├── attendance/
    │   ├── attendance.controller.ts  -- Endpoint: POST /api/attendance/process
    │   └── attendance.service.ts     -- Logika: validasi QR, catat absen, tambah XP
    │
    ├── events/
    │   ├── events.controller.ts  -- Endpoint: CRUD event, generate token
    │   └── events.service.ts     -- Logika: buat event, buat QR token, close event
    │
    ├── users/
    │   ├── users.controller.ts  -- Endpoint: GET /api/users/dashboard, leaderboard
    │   └── users.service.ts     -- Logika: statistik, profil, ranking
    │
    ├── members/
    │   ├── members.controller.ts  -- Endpoint: GET /api/members (daftar anggota)
    │   └── members.service.ts     -- Logika: query daftar anggota, import CSV
    │
    ├── xp/
    │   ├── xp.controller.ts  -- Endpoint: PATCH /api/xp/edit (edit XP manual)
    │   └── xp.service.ts     -- Logika: edit XP, catat riwayat
    │
    ├── leave/
    │   ├── leave.controller.ts  -- Endpoint: izin tidak hadir
    │   └── leave.service.ts     -- Logika: request izin, approve/reject
    │
    ├── logs/
    │   ├── logs.controller.ts  -- Endpoint: GET /api/logs (audit trail)
    │   └── logs.service.ts     -- Logika: simpan dan query log aktivitas
    │
    ├── anomalies/
    │   ├── anomalies.controller.ts  -- Endpoint: deteksi kecurangan
    │   └── anomalies.service.ts     -- Logika: deteksi device ganda, absen cepat
    │
    ├── news/
    │   ├── news.controller.ts  -- Endpoint: CRUD berita dan tutorial
    │   └── news.service.ts     -- Logika: simpan, arsipkan, slider featured
    │
    └── media/
        ├── media.controller.ts  -- Endpoint: upload gambar
        └── media.service.ts     -- Logika: upload ke Firebase Storage
```

### Frontend (apps/web/src/)

Frontend adalah tampilan yang dilihat pengguna di browser.

```
apps/web/src/
│
├── app/
│   ├── layout.tsx           -- Layout utama, favicon, meta SEO
│   ├── page.tsx             -- Halaman root, redirect ke /dashboard
│   │
│   ├── login/
│   │   └── page.tsx         -- Halaman login
│   │                           Email + password atau Google
│   │                           Tab Sign In dan Register
│   │
│   └── (dashboard)/
│       ├── layout.tsx       -- Wrapper: Sidebar + TopBar
│       │                       Semua halaman di bawah ini punya sidebar
│       │
│       ├── dashboard/
│       │   └── page.tsx     -- Halaman utama setelah login
│       │                       Statistik XP, level, streak
│       │                       Progress bar, news slider, quick actions
│       │
│       ├── scan/
│       │   └── page.tsx     -- Scanner QR Code
│       │                       Buka kamera, scan QR dari admin
│       │                       Ada fallback: input token manual
│       │
│       ├── news/
│       │   └── page.tsx     -- Berita dan Tutorial
│       │                       5 tab: Semua, News, Blog, Event, Tutorial
│       │                       Tutorial punya sub-kategori per pillar
│       │                       Support YouTube embed
│       │
│       ├── leaderboard/
│       │   └── page.tsx     -- Papan peringkat
│       │                       Top 3 dengan podium visual
│       │                       Tabel ranking lengkap
│       │
│       ├── change-password/
│       │   └── page.tsx     -- Ganti password
│       │
│       ├── members/
│       │   └── page.tsx     -- Daftar anggota NEWGAME
│       │                       Pencarian, filter, status
│       │
│       ├── logs/
│       │   └── page.tsx     -- Log aktivitas sistem (admin only)
│       │                       Filter berdasarkan aksi dan tanggal
│       │                       Export ke JSON
│       │
│       └── admin/
│           ├── page.tsx     -- Panel admin: kelola event
│           │                   Buat event, generate QR, close event
│           │
│           ├── news/
│           │   └── page.tsx -- Kelola berita dan tutorial
│           │                   CRUD post, YouTube URL, archive
│           │
│           └── media/
│               └── page.tsx -- Gallery media
│                               Upload gambar/logo/gif
│                               Copy URL, hapus
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx      -- Menu navigasi di kiri
│   │   │                       Logo NEWGAME, menu sesuai role
│   │   │                       Bisa dilipat, responsive mobile
│   │   │                       Foto profil + nama di bawah
│   │   │
│   │   └── TopBar.tsx       -- Bar di atas setiap halaman
│   │                           Judul halaman, XP badge, logout
│   │
│   └── news/
│       └── NewsSlider.tsx   -- Slider berita di dashboard
│                               Auto-play, dots navigation
│
├── lib/
│   ├── firebase.ts          -- Inisialisasi Firebase client SDK
│   │                           Untuk login dan baca data
│   │
│   ├── api.ts               -- HTTP client untuk panggil backend
│   │                           Auto-attach token, 15 detik timeout
│   │
│   └── auth-store.ts        -- State management (Zustand)
│                               Data user yang sedang login
│                               Username, foto profil, XP, level
│
└── styles/
    └── globals.css          -- Semua styling website
                                Warna, font, animasi, responsive
                                Dark theme, glassmorphism
```

---

## Koleksi Database (Firestore)

| Koleksi | Isi | Siapa yang pakai |
|---------|-----|-----------------|
| users | Data akun: nama, email, role, XP, foto profil | Auth, Dashboard, Leaderboard |
| events | Daftar kegiatan: nama, tanggal, XP reward | Admin Panel, Attendance |
| attendance | Riwayat kehadiran: siapa, kapan, di event mana | Scan QR, Dashboard |
| tokens | Token QR sementara (12 detik) | Scan QR |
| members | Data anggota lengkap: ID, pillar, generasi | Members Directory |
| news | Berita, blog, event, tutorial | News, Dashboard Slider |
| media | Daftar file yang di-upload | Media Gallery |
| logs | Catatan aktivitas sistem | System Logs |
| anomalies | Deteksi kecurangan | Backend otomatis |
| leave | Permintaan izin tidak hadir | Leave module |
| xp_history | Riwayat perubahan XP | XP module |

---

## Hubungan Antar Bagian

```
Browser pengguna
      |
      | HTTP request
      v
Next.js (port 3000) ──── Serve halaman + static files
      |
      | /api/* di-proxy ke backend
      v
NestJS (port 3001) ──── Proses logika bisnis
      |
      | Firebase Admin SDK
      v
Firestore ──── Simpan dan baca data
Firebase Auth ──── Verifikasi login
Firebase Storage ──── Simpan file upload
```

Setiap request dari browser:
1. Next.js cek apakah halaman atau API call
2. Jika halaman: render React component
3. Jika API: proxy ke NestJS backend
4. Backend cek token login via Firebase Auth Guard
5. Jika valid: proses request, baca/tulis Firestore
6. Kirim response ke browser
