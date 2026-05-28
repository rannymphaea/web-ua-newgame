# NEWGAME Developer Guide
Last updated: 21 Mei 2026

Panduan ini ditujukan untuk developer baru yang memegang codebase NEWGAME. Baca seluruh halaman ini sebelum melakukan perubahan pertama pada kode.

---

## Penanda dalam Kode

Dua komentar digunakan secara konsisten di seluruh codebase untuk membantu orientasi:

`// ALLOWED` menandai bagian yang aman dimodifikasi, seperti teks konten, warna, dan tata letak UI sederhana.

`// DO NOT EDIT` menandai bagian yang bersifat krusial terhadap stabilitas sistem. Modifikasi pada area ini berpotensi menyebabkan kerusakan pada proses build atau memutus koneksi ke database.

---

## Struktur Proyek

```
web-unandnewgame/
    apps/
        api/                  Backend NestJS (port 3001), 16 modul
        web/                  Frontend Next.js (port 3000), 20 halaman
            public/           Aset statis: logo.png, manifest.json
            src/
                app/
                    landing/          Halaman publik
                    login/            Halaman masuk
                    (dashboard)/      Seluruh halaman setelah autentikasi
                components/           Komponen antarmuka yang dapat digunakan ulang
                lib/                  Firebase, API client, Zustand store
                styles/               globals.css berisi seluruh token desain
            vercel.json               Hapus file ini saat siap deploy ke Vercel
            next.config.js            DO NOT EDIT
    .env                      Kredensial rahasia, tidak masuk ke repository
    .github/workflows/ci.yml  Pipeline CI GitHub Actions
    package.json              Konfigurasi root monorepo workspaces
    NEED_TO_DO.md             Daftar tugas penyelesaian sebelum dan sesudah rilis
    STYLE_GUIDE.md            Panduan visual dan konvensi CSS
    CONTRIBUTING.md           Prosedur kontribusi
    FIRESTORE_RULES.md        Aturan keamanan Firestore yang diterapkan
```

---

## File yang Aman Dimodifikasi (ALLOWED)

### Konten Landing Page

File `apps/web/src/app/landing/components/data.ts` adalah satu-satunya file yang perlu diedit untuk memperbarui seluruh konten halaman publik. Di dalamnya terdapat teks visi dan misi, nama dan jabatan pengurus inti, deskripsi masing-masing pilar, pertanyaan dan jawaban FAQ, tautan media sosial, serta angka statistik yang ditampilkan pada halaman. File `apps/web/src/app/landing/landing.css` dapat diedit untuk menyesuaikan tampilan visual halaman tersebut.

### Sistem Lencana dan Level

Seluruh definisi lencana tersimpan di `apps/api/src/modules/badges/badge-definitions.ts`. Untuk menambahkan lencana baru, tambahkan objek baru ke dalam array `BADGES` dengan format berikut:

```typescript
{
  id: 'identifikasi_unik',
  name: 'Nama Lencana',
  description: 'Deskripsi singkat',
  category: 'attendance',
  rarity: 'rare',
  icon: 'nama-ikon',
  condition: { type: 'auto', check: 'attendanceCount', value: 25 }
}
```

Ketentuan kenaikan level per pilar dapat diubah di `apps/api/src/modules/pillar-levels/pillar-definitions.ts`.

### Pengumuman dan Tampilan

Teks banner pengumuman yang muncul di dashboard diatur melalui objek `FALLBACK_ANNOUNCEMENT` di dalam `apps/web/src/components/ui/AnnouncementBanner.tsx`. Field yang tersedia adalah `title`, `message`, dan `type` (pilihan: `info`, `warning`, atau `urgent`). Token warna dan tipografi global berada di `apps/web/src/styles/globals.css`. Urutan dan label menu navigasi dapat diatur melalui variabel `NAV_ITEMS` di `apps/web/src/components/layout/Sidebar.tsx`. Logo organisasi dapat diganti dengan menimpa file `apps/web/public/logo.png`, format PNG dengan dimensi yang disarankan 256x256 piksel.

---

## File yang Tidak Boleh Diubah (DO NOT EDIT)

### Konfigurasi Inti

`apps/web/next.config.js` mengatur seluruh perilaku proses build Next.js termasuk pengoptimalan gambar, header keamanan, dan proxy API. Mengubah file ini tanpa pemahaman penuh dapat menyebabkan build gagal atau masalah CORS saat produksi.

`apps/api/src/main.ts` adalah titik masuk server NestJS. File ini mengonfigurasi CORS, rate limiting, prefix rute global, dan port server. `apps/api/src/app.module.ts` mendaftarkan seluruh 16 modul layanan backend. Modul baru harus didaftarkan di sini setelah file modul dibuat.

### Autentikasi dan Keamanan

Tiga file di `apps/web/src/lib/` bekerja sebagai satu unit yang saling bergantung: `firebase.ts` menginisialisasi koneksi ke layanan Firebase, `api.ts` menangani seluruh komunikasi HTTP dengan penyisipan token otomatis, dan `auth-store.ts` mengelola status autentikasi pengguna termasuk pembaruan token berkala. Mengubah salah satu dari ketiganya tanpa memahami keterkaitannya dapat menyebabkan pengguna tidak dapat masuk ke sistem.

Guard dan decorator di `apps/api/src/modules/auth/` bertanggung jawab atas validasi token dan pemeriksaan peran di setiap endpoint. File-file ini tidak boleh dimodifikasi kecuali ada perubahan kebutuhan autentikasi yang disengaja.

### Routing dan Layout

`apps/web/src/app/layout.tsx` adalah root layout yang memuat metadata PWA, konfigurasi Open Graph, dan penyedia Toast global. `apps/web/src/app/(dashboard)/layout.tsx` berfungsi sebagai auth guard. Ia memeriksa status login pengguna sebelum merender halaman apapun di dalam grup dashboard. Menghapus atau memodifikasi file ini akan membuka seluruh halaman dashboard tanpa memerlukan autentikasi.

### Nama Koleksi Firestore

Nama koleksi berikut tidak boleh diubah karena data yang sudah tersimpan di produksi menggunakan nama ini: `users`, `events`, `attendance`, `tokens`, `members`, `news`, `media`, `logs`, `anomalies`, `leave`, `xp_history`, `user_badges`, `user_pillar_levels`, `announcements`.

---

## Menjalankan Proyek

```bash
npm install --legacy-peer-deps

npm run dev
```

Perintah `npm run dev` menjalankan frontend dan backend secara bersamaan menggunakan konfigurasi monorepo. Untuk menjalankan keduanya secara terpisah, gunakan `npm run dev:api` dan `npm run dev:web`.

---

## Verifikasi sebelum Push ke GitHub

```bash
npm run build:api
npm run build:web
```

Proses CI di GitHub Actions menjalankan perintah yang identik. Jika kedua perintah ini berhasil secara lokal, pipeline CI di GitHub dipastikan akan lulus.

---

## Menambahkan Fitur Baru

Buat folder modul di `apps/api/src/modules/nama-fitur/` yang berisi `nama.module.ts`, `nama.service.ts`, dan `nama.controller.ts`. Daftarkan modul tersebut di `apps/api/src/app.module.ts`. Buat halaman di `apps/web/src/app/(dashboard)/nama/page.tsx` dan tambahkan entri ke variabel `NAV_ITEMS` di `Sidebar.tsx`.

---

## Sistem Peran Pengguna

| Peran | Akses |
|-------|-------|
| member | Dashboard, Scan, News, Leaderboard, Badges, Calendar, Profile |
| admin | Semua akses member ditambah Admin Panel, Analytics, Members, Logs, dan Export |
| superadmin | Setara dengan admin |

---

## Kontrol Deployment Vercel

Selama file `apps/web/vercel.json` ada di repositori, Vercel tidak akan melakukan deployment otomatis meskipun ada push ke GitHub. Ini disengaja agar proses rilis dapat dikontrol sepenuhnya oleh tim. Saat sudah siap untuk merilis ke produksi, hapus file tersebut, pastikan seluruh environment variables telah dikonfigurasi di Vercel Dashboard, lalu lakukan push ke GitHub.

---

## Pemecahan Masalah Umum

Jika login gagal, periksa konfigurasi di `apps/web/.env.local` dan pastikan nilai Firebase API key sudah benar. Jika API mengembalikan error 500, pastikan file `serviceAccountKey.json` tersedia di root proyek. Jika QR scan tidak merespons, kemungkinan besar belum ada event yang aktif; buat event baru melalui halaman Admin. Jika CI di GitHub gagal, jalankan `npm run build:web` secara lokal terlebih dahulu karena pesan error akan jauh lebih mudah dibaca di terminal dibandingkan di log GitHub Actions.

---

## Teknologi yang Digunakan

| Lapisan | Teknologi | Versi |
|---------|-----------|-------|
| Frontend | Next.js | 14.2 |
| Styling | Vanilla CSS | - |
| State Management | Zustand | 4.5 |
| Backend | NestJS | 10 |
| Database | Firebase Firestore | - |
| Autentikasi | Firebase Auth | - |
| Penyimpanan | Firebase Storage | - |
| Pemindai QR | html5-qrcode | 2.3 |
| Visualisasi Data | Recharts | 2.12 |
