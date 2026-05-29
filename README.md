<div align="center">
  <img src="apps/web/public/logo.png" alt="NEWGAME" width="80" />

  <h1>NEWGAME</h1>
  <p>Platform web UKM Game Development Universitas Andalas</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Firebase-Admin-orange?logo=firebase" alt="Firebase" />
    <a href="https://unandnewgame.vercel.app"><img src="https://img.shields.io/badge/Live-unandnewgame.vercel.app-black?logo=vercel" alt="Live" /></a>
  </p>
</div>

---

NEWGAME adalah platform manajemen organisasi berbasis web yang dibangun untuk UKM Game Development Universitas Andalas. Sistem ini menggabungkan absensi QR Code dengan mekanisme gamifikasi — setiap kehadiran menghasilkan EXP, naik level, dan bersaing di leaderboard antar anggota.

Dibangun sebagai monorepo: frontend **Next.js** dan backend **NestJS**, keduanya di TypeScript, di-deploy ke Vercel.

---

## Fitur

**Untuk anggota:**
- Scan QR Code absensi langsung dari kamera browser
- Dashboard XP, level, streak, rank, dan badge real-time
- Leaderboard global dan per-divisi
- Upload foto profil, pilihan avatar karakter
- Berita, kalender event, dan notifikasi pengumuman

**Untuk admin & superadmin:**
- Buat event dan generate token QR absensi
- Analytics kehadiran dan deteksi anomali otomatis
- Manajemen berita, media, dan galeri
- Ekspor laporan kehadiran
- Manajemen role anggota (member / admin / superadmin)
- Log aktivitas sistem untuk keperluan audit

---

## Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 15, TypeScript, Vanilla CSS |
| Backend | NestJS 10, TypeScript |
| Database | Cloud Firestore |
| Auth | Firebase Authentication + Google OAuth |
| Storage | Cloudinary |
| AI | OpenAI, Groq SDK |
| Deploy | Vercel (frontend + backend) |

---

## Struktur Proyek

```
web-ua-newgame/
├── apps/
│   ├── api/               Backend NestJS
│   │   └── src/
│   │       ├── modules/   Auth, users, attendance, xp, badges, events, media, ...
│   │       ├── firebase/  Firebase Admin SDK
│   │       └── common/    Guards, decorators, middleware
│   │
│   └── web/               Frontend Next.js
│       └── src/
│           ├── app/       landing/, login/, dashboard/
│           ├── components/
│           ├── lib/       Firebase client, API client, Zustand store
│           └── styles/    globals.css — design token system
│
├── ACCOUNT_GUIDE.md       Panduan pendaftaran anggota baru
└── vercel.json
```

---

## Setup Lokal

**Prasyarat:** Node.js 18+, akun Firebase, akun Cloudinary.

```bash
git clone https://github.com/rannymphaea/web-ua-newgame.git
cd web-ua-newgame
npm install --legacy-peer-deps
```

**Frontend** — buat `apps/web/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend** — buat `apps/api/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
FIREBASE_CREDENTIALS_JSON=<isi dengan konten serviceAccountKey.json>
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
```

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

Proyek ini menggunakan dua Vercel project terpisah dari satu repository.

**Frontend:**
1. Import repo → set Root Directory ke `apps/web`
2. Tambahkan semua env dari `.env.local` + `NEXT_PUBLIC_API_URL` (URL backend)

**Backend (API):**
1. Import repo → set Root Directory ke `apps/api`
2. Tambahkan semua env dari `.env` — khususnya `FIREBASE_CREDENTIALS_JSON` (isi seluruh konten JSON-nya, bukan path file)

---

## Pendaftaran Anggota

Sistem registrasi memerlukan **Member ID** dan **Kode Akses** yang diberikan admin. Lihat [ACCOUNT_GUIDE.md](./ACCOUNT_GUIDE.md) untuk panduan lengkap cara membuat akun dan instruksi untuk admin membuat data member di Firestore.

---

## Lisensi

MIT © 2025 NEWGAME — Universitas Andalas

---

<div align="center">
  <sub>
    <a href="https://www.instagram.com/unandnewgame">Instagram</a> ·
    <a href="https://youtube.com/@unandnewgame">YouTube</a> ·
    <a href="mailto:unandnewgame@gmail.com">Email</a>
  </sub>
</div>