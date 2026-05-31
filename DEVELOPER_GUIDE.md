# Panduan Developer NEWGAME

Dokumen ini untuk siapa saja yang mau ikut develop platform ini. Bacalah dulu dari awal sebelum mulai ngoding, supaya tidak bingung dengan struktur dan kebiasaan yang sudah ada di codebase.

---

## Penanda kode

Ada dua komentar khusus yang sering muncul di codebase ini:

`// ALLOWED` — bagian yang aman untuk diedit. Biasanya berisi teks konten, warna, atau data konfigurasi sederhana.

`// DO NOT EDIT` — bagian krusial yang kalau salah diutak-atik bisa merusak build atau memutus koneksi ke database.

---

## Struktur folder

```
apps/
├── api/                  Backend NestJS, jalan di port 3001
│   └── src/
│       ├── modules/      21 modul layanan (attendance, xp, badges, dll)
│       ├── firebase/     Inisialisasi Firebase Admin SDK
│       └── common/       Guard, decorator, middleware bersama
└── web/                  Frontend Next.js, jalan di port 3000
    └── src/
        ├── app/          Halaman (App Router Next.js 14)
        │   ├── landing/  Halaman publik
        │   ├── login/    Login Google
        │   └── (dashboard)/  Semua halaman setelah login
        ├── components/   Komponen UI yang dipakai ulang
        ├── lib/          Firebase client, API client, Zustand store
        └── styles/       globals.css — semua token desain CSS ada di sini
```

---

## File yang aman diedit

**Konten landing page** — semua teks di halaman publik diambil dari satu file: `apps/web/src/app/landing/components/data.ts`. Kalau mau ubah nama pengurus, deskripsi pilar, FAQ, atau link sosial media, editnya di sana. Tampilannya bisa diatur di `apps/web/src/app/landing/landing.css`.

**Lencana dan level** — definisi semua lencana ada di `apps/api/src/modules/badges/badge-definitions.ts`. Untuk menambah lencana baru, tambahkan objek ke array `BADGES` dengan format yang sudah ada. Level per pilar diatur di `apps/api/src/modules/pillar-levels/pillar-definitions.ts`.

**Banner pengumuman** — teks fallback banner dashboard ada di `apps/web/src/components/ui/AnnouncementBanner.tsx`, di objek `FALLBACK_ANNOUNCEMENT`.

**Navigasi sidebar** — urutan dan label menu bisa diubah di variabel `NAV_ITEMS` dalam `apps/web/src/components/layout/Sidebar.tsx`.

**Logo** — ganti file `apps/web/public/logo.png`. Disarankan pakai PNG 256x256.

---

## File yang jangan diutak-atik

**`apps/web/next.config.js`** — mengatur build Next.js, header keamanan, dan proxy API. Kalau salah edit di sini, build bisa gagal total.

**`apps/api/src/main.ts`** — titik masuk server backend. Di sini ada konfigurasi CORS, rate limiting, dan prefix route global.

**`apps/api/src/app.module.ts`** — semua modul backend didaftarkan di sini. Kalau buat modul baru, daftarkan juga di file ini.

**Tiga file di `apps/web/src/lib/`** — `firebase.ts`, `api.ts`, dan `auth-store.ts` bekerja sebagai satu unit. Mengubah salah satu tanpa memahami ketiga-tiganya bisa membuat user tidak bisa login.

**Nama koleksi Firestore** — jangan pernah ganti nama koleksi ini: `users`, `events`, `attendance`, `tokens`, `members`, `news`, `media`, `logs`, `anomalies`, `leave`, `xp_history`, `user_badges`, `user_pillar_levels`, `announcements`. Data produksi sudah menggunakan nama ini.

---

## Standar penulisan kode

Proyek ini pakai TypeScript strict mode di semua sisi. Beberapa aturan yang wajib diikuti:

- Indentasi 2 spasi, bukan tab
- String pakai single quote, kecuali ada single quote di dalamnya
- Panjang baris maksimal 120 karakter
- Trailing comma pada objek dan array multiline — ini memperkecil diff saat merge

Penamaan:
- Komponen React dan nama tipe/interface: `PascalCase`
- File modul dan CSS: `kebab-case` (contoh: `badge-definitions.ts`)
- Variabel dan fungsi: `camelCase`
- Konstanta global: `UPPER_SNAKE_CASE`
- Koleksi Firestore: `snake_case`
- Kelas CSS dan endpoint API: `kebab-case`

Di frontend, hindari inline style kecuali nilainya memang dihitung secara dinamis saat runtime. Gunakan variabel CSS dari `globals.css` (`--clr-gold`, `--clr-bg`, dll) daripada warna hardcoded.

Di backend, controller tidak boleh punya logika bisnis — tugasnya hanya menerima request dan lempar ke service. Semua validasi input wajib pakai DTO dengan `class-validator`.

---

## Setup lokal

```bash
git clone https://github.com/rannymphaea/web-ua-newgame.git
cd web-ua-newgame
npm install --legacy-peer-deps
```

Salin `apps/api/.env.example` ke `apps/api/.env` dan isi nilainya. Buat `apps/web/.env.local` dengan konfigurasi Firebase. Letakkan `serviceAccountKey.json` (dari Firebase Console > Project Settings > Service Accounts) di dalam folder `apps/api/`.

```bash
npm run dev
```

---

## Alur kontribusi

Semua perubahan harus lewat branch dan Pull Request. Jangan push langsung ke `main`.

```bash
git checkout main && git pull
git checkout -b feature/nama-fitur
```

Sebelum push, pastikan build berhasil:

```bash
npm run build:api
npm run build:web
```

Format pesan commit yang dipakai:
```
feat: tambah halaman kalender
fix: perbaiki validasi token QR expired
docs: update panduan instalasi
refactor: pisahkan logika XP ke service sendiri
style: sesuaikan padding card leaderboard
```

Buat Pull Request via GitHub. CI akan otomatis jalankan build dan type check. PR baru bisa di-merge setelah CI hijau dan ada satu approval.

---

## Pemecahan masalah umum

**Firebase timeout** — kalau API jalan tapi panggilan ke Firestore timeout, kemungkinan diblokir firewall atau antivirus. Tambahkan pengecualian untuk domain `*.firebaseio.com`, `*.googleapis.com`, dan `*.gstatic.com`. Kalau di jaringan kampus atau kantor yang pakai proxy, tambahkan variabel `HTTP_PROXY` dan `HTTPS_PROXY` di `.env`.

**Storage bucket tidak ditemukan (error 404)** — Firebase Storage butuh upgrade ke paket Blaze dan bucket harus diaktifkan manual di Firebase Console. Kalau tidak mau upgrade, gunakan Cloudinary — konfigurasinya sudah ada di `apps/api/.env.example`.

**Upload foto gagal** — pastikan variabel `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, dan `CLOUDINARY_API_SECRET` sudah diisi di `.env`. Restart backend setelah mengisi variabel ini..
