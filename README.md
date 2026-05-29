<div align="center">
  <img src="apps/web/public/logo.png" alt="NEWGAME Logo" width="80" height="80" />

  <h1>NEWGAME</h1>
  <p><strong>Attendance & Gamification Platform</strong></p>
  <p>Platform manajemen absensi berbasis web untuk Unit Aktivitas Mahasiswa NEWGAME, Universitas Andalas.</p>

  <p>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
    <img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-5.3-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Firebase-Admin-orange?logo=firebase" alt="Firebase" />
    <a href="https://vercel.com"><img src="https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel" alt="Vercel" /></a>
  </p>

  <br />

  <img src="apps/web/public/yua.png" alt="Platform Preview" width="160" />
</div>

---

## Tentang

NEWGAME adalah platform web full-stack yang dibangun khusus untuk organisasi game development mahasiswa di Universitas Andalas. Platform ini menggabungkan sistem absensi QR Code dengan mekanisme gamifikasi — anggota mendapatkan EXP setiap kali hadir, naik level, dan bersaing di leaderboard. Tujuannya sederhana: bikin kegiatan organisasi terasa lebih menarik dan keterlibatan anggota lebih terukur.

Platform ini dibangun dari nol sebagai monorepo dengan dua aplikasi terpisah: frontend Next.js dan backend NestJS, keduanya ditulis penuh dalam TypeScript.

---

## Fitur

<table>
  <tr>
    <td valign="top" width="50%">
      <strong>Untuk Anggota</strong>
      <ul>
        <li>Login Google via Firebase Authentication</li>
        <li>Scan QR Code absensi dari kamera browser</li>
        <li>Dashboard XP, level, streak, dan rank real-time</li>
        <li>Leaderboard global dan per-divisi</li>
        <li>Koleksi lencana berdasarkan milestone</li>
        <li>Profil publik dengan riwayat aktivitas</li>
        <li>Pilihan avatar karakter (Default, Neko, Chibi, Yua)</li>
        <li>Upload foto profil via Cloudinary</li>
        <li>Halaman berita, kalender event, dan pengumuman</li>
      </ul>
    </td>
    <td valign="top" width="50%">
      <strong>Untuk Admin</strong>
      <ul>
        <li>Buat event dan generate token QR</li>
        <li>Dashboard analytics kehadiran real-time</li>
        <li>Manajemen berita dan pengumuman</li>
        <li>Log aktivitas sistem untuk audit</li>
        <li>Deteksi anomali kehadiran otomatis</li>
        <li>Manajemen media dan galeri aset</li>
        <li>Ekspor laporan kehadiran</li>
      </ul>
    </td>
  </tr>
</table>

---

## Stack Teknologi

| Kategori | Teknologi |
|---|---|
| Frontend | Next.js 14, TypeScript, Vanilla CSS |
| Backend | NestJS 10, TypeScript |
| Database | Cloud Firestore |
| Autentikasi | Firebase Authentication (Google OAuth) |
| Media Storage | Cloudinary |
| AI / Analytics | Groq SDK, OpenAI, Isolation Forest |
| Deployment | Vercel (Frontend), Render (Backend) |
| CI/CD | GitHub Actions |

---

## Struktur Proyek

```
web-ua-newgame/
├── apps/
│   ├── api/                    Backend NestJS (port 3001)
│   │   └── src/
│   │       ├── modules/        21 modul layanan
│   │       │   ├── auth/
│   │       │   ├── attendance/
│   │       │   ├── users/
│   │       │   ├── xp/
│   │       │   ├── badges/
│   │       │   ├── events/
│   │       │   ├── media/
│   │       │   ├── news/
│   │       │   ├── leaderboard/
│   │       │   ├── pillar-levels/
│   │       │   ├── ai/
│   │       │   └── anomalies/
│   │       ├── firebase/       Firebase Admin SDK
│   │       └── common/         Guard, decorator, middleware
│   │
│   └── web/                    Frontend Next.js (port 3000)
│       └── src/
│           ├── app/            Halaman (App Router)
│           │   ├── landing/
│           │   ├── login/
│           │   └── (dashboard)/   20 halaman dashboard
│           ├── components/     Komponen UI reusable
│           ├── lib/            Firebase client, API client, Zustand
│           └── styles/         globals.css — design token system
│
├── LICENSE
├── README.md
├── DEVELOPER_GUIDE.md
├── SECURITY.md
├── CHANGELOG.md
└── vercel.json
```

---

## Memulai

### Prasyarat

- Node.js v18+
- Akun Firebase (Firestore + Google Auth)
- Akun Cloudinary (gratis, tidak perlu kartu kredit)

### Instalasi

```bash
git clone https://github.com/rannymphaea/web-ua-newgame.git
cd web-ua-newgame
npm install --legacy-peer-deps
```

### Konfigurasi

**1. Frontend** — buat file `apps/web/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**2. Backend** — salin `apps/api/.env.example` ke `apps/api/.env` dan isi:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
FIREBASE_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**3.** Letakkan `serviceAccountKey.json` dari Firebase Console (Project Settings → Service Accounts → Generate new private key) ke dalam folder `apps/api/`.

### Menjalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Deployment

### Frontend ke Vercel

1. Import repository ini di [vercel.com](https://vercel.com)
2. Set **Root Directory** ke `apps/web`
3. Tambahkan semua isi `.env.local` ke Environment Variables
4. Tambahkan variabel `NEXT_PUBLIC_API_URL` dengan URL backend produksi kamu
5. Deploy

### Backend ke Render / Railway

1. Buat Web Service baru, hubungkan ke repository ini
2. Set **Root Directory** ke `apps/api`
3. Build command: `npm run build`
4. Start command: `npm run start:prod`
5. Tambahkan semua variabel dari `apps/api/.env`

---

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Setup lokal, standar kode, alur kontribusi, troubleshooting |
| [SECURITY.md](./SECURITY.md) | Arsitektur keamanan, Firestore rules, prosedur insiden |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat perubahan per sesi pengembangan |

---

## Kontribusi

Pull request selalu disambut. Baca [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) terlebih dahulu, buat branch dari `main`, dan pastikan build berhasil sebelum membuka PR.

```bash
git checkout -b feature/nama-fitur
# ... kerjakan perubahan
npm run build:api && npm run build:web
git push origin feature/nama-fitur
```

---

## Lisensi

Didistribusikan di bawah [MIT License](./LICENSE).  
Copyright © 2025 NEWGAME — Universitas Andalas.

---

<div align="center">
  <sub>
    <a href="https://www.instagram.com/unandnewgame">Instagram</a> ·
    <a href="https://youtube.com/@unandnewgame">YouTube</a> ·
    <a href="mailto:unandnewgame@gmail.com">Email</a>
  </sub>
</div>