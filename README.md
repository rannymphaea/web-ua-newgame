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

## Tentang Platform Ini

NEWGAME adalah platform web internal untuk komunitas game developer mahasiswa Universitas Andalas. Sistem ini dirancang untuk menggantikan pencatatan manual kehadiran dan penilaian anggota dengan sistem gamifikasi yang menyenangkan — mirip seperti bermain RPG, tapi versi organisasi kampus.

Anggota yang aktif mengerjakan task, hadir di rapat, dan berkontribusi pada proyek akan mendapatkan **XP (Experience Points)**, naik level, dan mendapat badge khusus. Siapa yang paling aktif akan tampil di leaderboard. Yang konsisten berkesempatan mewakili UKM di kompetisi GameJam nasional maupun internasional.

---

## Fitur Utama

### Untuk Anggota
- **Absensi QR Code** — Scan QR di setiap kegiatan untuk mencatat kehadiran
- **Profil & Level** — Lihat progress XP, level, dan riwayat kehadiran
- **Leaderboard** — Peringkat anggota berdasarkan total XP
- **Badge Collection** — Koleksi lencana yang bisa diraih dari pencapaian tertentu
- **Berita & Tutorial** — Konten edukasi seputar game development
- **Kalender Event** — Jadwal kegiatan mendatang

### Untuk Admin
- **Manajemen Berita** — Buat, edit, dan publish artikel
- **Media Gallery** — Upload dan kelola aset media
- **Kelola Anggota** — Lihat data semua member, edit peran
- **System Logs** — Pantau aktivitas sistem
- **Analytics** — Statistik keaktifan dan pertumbuhan komunitas

### Halaman Publik
- **Landing Page** — Profil organisasi lengkap: visi misi, struktur, pillar, quest, sistem EXP
- **Guidebook Interaktif** — Panduan lengkap di [2b-eternity.github.io/test](https://2b-eternity.github.io/test/)

---

## Teknologi

### Frontend (`apps/web`)
| Teknologi | Versi | Fungsi |
|---|---|---|
| Next.js | 14 | Framework React dengan App Router |
| TypeScript | 5 | Type safety |
| Zustand | 4 | State management (auth, tema) |
| Framer Motion | 11 | Animasi halaman dan komponen |
| Firebase SDK | 10 | Auth client-side + Firestore |
| Remix Icon | 4.5 | Icon library |
| next/font | - | Optimasi loading Google Fonts |

### Backend (`apps/api`)
| Teknologi | Versi | Fungsi |
|---|---|---|
| NestJS | 10 | Framework Node.js |
| Firebase Admin | 12 | Verifikasi token + Firestore |
| Helmet | - | HTTP security headers |
| class-validator | - | DTO validation |

### Infrastruktur
| Layanan | Fungsi |
|---|---|
| Firebase Auth | Autentikasi email/password |
| Firebase Firestore | Database utama (NoSQL) |
| Firebase Storage | Penyimpanan media/gambar |
| Vercel (opsional) | Hosting frontend |

---

## Struktur Proyek

```
web-unandnewgame/
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── public/                 # Aset statis (logo, karakter OC)
│   │   │   ├── oc-main.png         # Karakter dashboard hero
│   │   │   ├── oc-hero.png         # Karakter leaderboard
│   │   │   ├── oc-gold.png         # Karakter premium
│   │   │   └── logo.png
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx      # Root layout (font, icons, theme)
│   │       │   ├── page.tsx        # Root redirect (→ /dashboard atau /landing)
│   │       │   ├── login/          # Halaman login
│   │       │   ├── landing/        # Landing page publik
│   │       │   └── (dashboard)/    # Grup halaman dashboard (auth-guarded)
│   │       │       ├── layout.tsx  # Auth guard + sidebar + topbar
│   │       │       ├── dashboard/  # Halaman utama
│   │       │       ├── scan/       # Scan QR absensi
│   │       │       ├── news/       # Berita & tutorial
│   │       │       ├── leaderboard/
│   │       │       ├── badges/
│   │       │       ├── profile/
│   │       │       ├── members/
│   │       │       ├── logs/
│   │       │       ├── calendar/
│   │       │       ├── change-password/
│   │       │       └── admin/      # Panel admin (role-gated)
│   │       ├── components/
│   │       │   ├── layout/         # Sidebar, TopBar
│   │       │   ├── ui/             # Toast, Cursor, Banner, ErrorBoundary
│   │       │   └── news/           # NewsSlider
│   │       ├── lib/
│   │       │   ├── auth-store.ts   # Zustand auth state
│   │       │   ├── firebase.ts     # Firebase config
│   │       │   ├── api.ts          # HTTP client (axios-like)
│   │       │   └── theme-engine.ts # Dark/light mode
│   │       └── styles/
│   │           └── globals.css     # Design system lengkap
│   └── api/                        # NestJS backend
│       └── src/
│           ├── app.module.ts
│           ├── security/           # SecurityModule
│           └── ...modules
├── TRACKING.md                     # Catatan progres pengembangan
├── NOTULENSI.md                    # Notulensi & keputusan desain
├── README.md                       # File ini
└── package.json                    # Workspace root
```

---

## Cara Menjalankan

### Prasyarat
- Node.js 18 atau lebih baru
- npm 9+
- Akun Firebase dengan project yang sudah dibuat

### 1. Clone & Install
```bash
git clone <repo-url>
cd web-unandnewgame
npm install
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
JWT_SECRET=your_jwt_secret_min_32_chars
PORT=3001
```

### 3. Jalankan
```bash
# Frontend saja
npm run dev --workspace=apps/web
# → http://localhost:3000

# Backend saja
npm run dev --workspace=apps/api
# → http://localhost:3001

# Keduanya (jika ada script concurrently)
npm run dev
```

---

## Sistem Gamifikasi

### Cara Kerja XP
- Setiap kehadiran, task selesai, atau kontribusi memberikan XP
- **Level** = `Math.floor(totalXP / 100) + 1`
- Progress level ditampilkan sebagai liquid bar animasi di bagian atas layar
- Setiap 100 XP naik 1 level

### Sistem Rank
| Rank | Warna | Keterangan |
|---|---|---|
| Novice | Abu-abu | Anggota baru |
| Apprentice | Hijau | Mulai aktif |
| Knight | Biru | Anggota tetap |
| Champion | Ungu | Sangat aktif |
| Legend | Emas | Kontribusi luar biasa |

### Cara Dapat XP
- ✅ Hadir rapat mingguan
- ✅ Menyelesaikan task yang diberikan
- ✅ Berkontribusi pada proyek
- ✅ Memenangkan internal GameJam
- ✅ Mewakili UKM di kompetisi eksternal

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
- **Cormorant Garamond** — Teks panjang di landing page
- **Pinyon Script** — Dekoratif (landing page)

### Karakter OC (Original Character)
Platform menggunakan karakter animasi sebagai maskot:
- `oc-main.png` — Hero dashboard, greeter utama
- `oc-hero.png` — Leaderboard champion
- `oc-gold.png` — Achievement/reward
- `oc-read.png` — Section tutorial/baca
- `oc-cmd.png` — Section teknis/command

---

## Performa

Beberapa keputusan teknis yang dibuat khusus untuk kecepatan:

**Remix Icons non-blocking** — CSS icon library dimuat dengan trik `media="print"` sehingga tidak menunda render pertama sama sekali.

**Optimistic auth** — Firebase menyimpan sesi di IndexedDB. Saat user kembali membuka aplikasi, `auth.currentUser` tersedia secara sinkronus sebelum callback `onAuthStateChanged` terpanggil. Ini kita manfaatkan agar dashboard langsung tampil tanpa spinner.

**Two-phase dashboard** — Konten hero (nama, level, XP) muncul instan dari Zustand store. Stat cards menyusul dalam ~50ms. News dan leaderboard dimuat di background setelah 100ms, tidak menghalangi interaksi.

**Font scope** — Cormorant Garamond dan Pinyon Script hanya dimuat di halaman `/landing`, bukan global. Ini menghemat ~80KB di setiap halaman dashboard.

---

## Keamanan

- JWT token diverifikasi di setiap request backend via Firebase Admin
- Token di-refresh otomatis setiap 10 menit di client
- Rate limiting per IP di level NestJS
- Request sanitization (XSS, SQL injection prevention)
- HTTP security headers via Helmet + Next.js config
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`

---

## Guidebook

Panduan lengkap organisasi NEWGAME tersedia di:

**[https://2b-eternity.github.io/test/](https://2b-eternity.github.io/test/)**

Berisi: struktur organisasi, sistem penilaian EXP, divisi (quest), 3 pillar, profil Main Core, dan FAQ kegiatan. Didesain dengan gaya handwritten interaktif.

---

## Kontribusi

Proyek ini dikembangkan oleh tim internal NEWGAME. Untuk berkontribusi:

1. Fork repository
2. Buat branch baru: `git checkout -b fitur/nama-fitur`
3. Commit dengan pesan yang jelas: `git commit -m "feat: tambah halaman X"`
4. Push dan buat Pull Request

---

## Lisensi

Internal use only — NEWGAME UKM Universitas Andalas © 2026

---

<div align="center">
  <strong>Learn · Create · Play</strong><br/>
  <em>NEWGAME — Universitas Andalas</em>
</div>