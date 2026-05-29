# NEWGAME Developer Guide

Dokumen ini ditujukan untuk developer baru yang memegang codebase NEWGAME. Baca seluruh halaman ini sebelum melakukan perubahan pertama pada kode.

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

Teks banner pengumuman yang muncul di dashboard diatur melalui objek `FALLBACK_ANNOUNCEMENT` di dalam `apps/web/src/components/ui/AnnouncementBanner.tsx`. Field yang tersedia adalah `title`, `message`, dan `type` (pilihan: info, warning, atau urgent). Token warna dan tipografi global berada di `apps/web/src/styles/globals.css`. Urutan dan label menu navigasi dapat diatur melalui variabel `NAV_ITEMS` di `apps/web/src/components/layout/Sidebar.tsx`. Logo organisasi dapat diganti dengan menimpa file `apps/web/public/logo.png`, format PNG dengan dimensi yang disarankan 256x256 piksel.

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

## Panduan Gaya Penulisan Kode (Style Guide)

Panduan ini mengatur standar penulisan kode sumber untuk memastikan konsistensi dan kemudahan pemeliharaan di seluruh platform NEWGAME.

### Konvensi Umum
Proyek ini menggunakan TypeScript dengan mode strict yang diaktifkan secara ketat pada konfigurasi compiler. Indentasi kode menggunakan dua spasi dan tidak diperkenankan menggunakan tab. Penggunaan titik koma (semicolon) pada akhir baris bersifat opsional untuk kode frontend namun sangat diwajibkan pada kode backend. String harus diapit oleh tanda kutip tunggal (single quote), kecuali jika string tersebut memuat tanda kutip tunggal di dalamnya. Penggunaan trailing comma pada objek multiline sangat disarankan untuk mengurangi konflik saat penggabungan kode (merge). Batas maksimum panjang satu baris adalah 120 karakter.

### Aturan Penamaan
- Komponen antarmuka React dan nama tipe atau antarmuka (interface) harus ditulis dengan gaya PascalCase.
- Seluruh penamaan file modul, layanan (service), definisi fitur, serta lembar gaya (CSS) wajib menggunakan gaya kebab-case. Contoh: `badge-definitions.ts` atau `landing.css`.
- Nama variabel biasa dan nama fungsi di dalam kode harus ditulis menggunakan gaya camelCase.
- Konstanta global harus menggunakan gaya UPPER_SNAKE_CASE.
- Koleksi Firestore wajib dinamai dengan snake_case, seperti `user_badges` atau `xp_history`.
- Penamaan kelas CSS harus menggunakan format kebab-case, contoh: `.glow-card`.
- Pola penamaan endpoint API juga harus menggunakan format kebab-case, misalnya `/api/pillar-levels`.

### Struktur Pengembangan Frontend (Next.js)
- Direktif 'use client' hanya boleh ditempatkan pada komponen yang memerlukan pengelolaan state interaktif, efek samping (effects), atau pengikatan fungsi event handler.
- Penataan desain dilarang menggunakan gaya sebaris (inline styles) kecuali jika parameter yang disisipkan sangat dinamis (dihitung saat eksekusi runtime).
- Setiap halaman atau komponen kompleks yang memerlukan tata letak khusus harus memiliki lembar gayanya masing-masing dan diimpor pada lapisan modul terkait.
- Pengelolaan status antar-komponen berskala besar dilakukan dengan memanfaatkan pustaka Zustand, sementara untuk urusan state lokal sederhana direkomendasikan untuk menggunakan hook standar bawaan React.
- Integrasi panggilan HTTP ke endpoint tidak diizinkan dilakukan langsung menggunakan fetch mentah. Seluruh proses pengambilan, pengiriman, hingga unggah data harus selalu merujuk pada pemanggilan fungsi melalui modul klien API (`lib/api.ts`).
- Gunakan ikon SVG sebagai alternatif untuk elemen visual dalam antarmuka. Menyisipkan emoji dalam teks tidak dibenarkan dalam penyusunan elemen UI profesional, terkecuali sebagai bagian data input dari pengguna.
- Penggunaan warna hardcoded secara eksplisit (seperti pemanggilan kode `#ffffff` secara langsung) sangat tidak disarankan. Gunakan sistem variabel bawaan CSS (`--clr-gold`, `--clr-bg`, dll.) yang didefinisikan pada file `globals.css`.

### Struktur Pengembangan Backend (NestJS)
- Pengembangan logika backend diatur berdasarkan pola modular dan Domain-Driven Design (DDD). Modul baru wajib dienkapsulasi dengan pemisahan peran yang tegas.
- Berkas pengendali (controller) dibebaskan dari setiap beban logika bisnis komputasi. Tugas pengendali (controller) melingkupi pemrosesan request dari klien (seperti ekstraksi header, body, token) untuk kemudian diumpan ke modul layanan (service).
- Modul layanan (service) berperan penuh menanggung aktivitas validasi entitas, pelaksanaan kaidah bisnis, serta modifikasi persisten pada basis data Firestore.
- Keamanan akses pada keseluruhan sistem API dilindungi dengan integrasi skema Firebase Auth. Tiap endpoint yang terbuka menerima permintaan wajib diselubungi dekorator `FirebaseAuthGuard`. Endpoint administratif sensitif memerlukan penambahan filter spesifik melalui penyematan dekorator `RolesGuard`.
- Validasi masuknya informasi ke backend dimandatkan penuh ke dalam berkas Data Transfer Object (DTO) menggunakan utilitas pustaka `class-validator`.
- Kesalahan pemrosesan dari segala jenis kegagalan fungsional yang terjadi selama rutinitas service harus dilemparkan kembali dalam rupa kelas `HttpException` dengan kode status HTTP yang sesuai.

---

## Panduan Kontribusi

### Persiapan Lingkungan Pengembangan
Pastikan Node.js versi 18 atau lebih tinggi sudah terpasang.

```bash
git clone https://github.com/rannymphaea/web-ua-newgame.git
cd web-ua-newgame
npm install --legacy-peer-deps
```

Setelah instalasi selesai, salin file `.env.example` ke `.env` untuk konfigurasi backend, dan buat file `.env.local` di dalam folder `apps/web` untuk konfigurasi frontend. Minta file `serviceAccountKey.json` dari admin dan tempatkan di root proyek. Jalankan inisialisasi data awal dengan perintah `cd apps/api && node src/scripts/seed-members.js`.

```bash
npm run dev
```

Buka http://localhost:3000 untuk memverifikasi bahwa sistem berjalan dengan benar.

### Alur Kerja Kontribusi
Seluruh perubahan harus dilakukan melalui branch terpisah, tidak langsung ke `main`. Buat branch baru dari `main` yang terbaru:

```bash
git checkout main
git pull origin main
git checkout -b feature/nama-fitur
```

Kerjakan perubahan pada branch tersebut. Sebelum melakukan commit, verifikasi bahwa proses build berhasil:

```bash
npm run build:api
npm run build:web
```

### Format Pesan Commit
Gunakan format ringkas dan deskriptif yang mencerminkan jenis perubahan yang dilakukan:

```
feat: tambah sistem notifikasi ke dashboard
fix: perbaiki validasi token QR yang expired
docs: perbarui panduan instalasi di README
refactor: pisahkan logika XP ke service tersendiri
style: sesuaikan padding card di halaman leaderboard
```

### Pull Request
Setelah perubahan siap, push branch ke repository:

```bash
git push origin feature/nama-fitur
```

Buat Pull Request melalui GitHub. CI akan secara otomatis menjalankan proses build dan type check. Pull Request hanya dapat digabungkan setelah CI lulus dan mendapat persetujuan dari minimal satu anggota tim lain.

---

## Pemecahan Masalah dan Perbaikan (Troubleshooting)

### Masalah Koneksi Firebase Timeout
Jika NestJS API server berjalan dengan normal namun panggilan ke Firestore/Auth/Storage mengalami timeout:

1. Periksa Firewall / Antivirus:
   Tambahkan pengecualian untuk domain Firebase berikut:
   - `*.firebaseio.com`
   - `*.googleapis.com`
   - `*.gstatic.com`
2. Periksa Pengaturan Proxy:
   Jika berada di belakang proxy korporat, konfigurasikan di file `.env`:
   ```env
   HTTP_PROXY=http://your-proxy:port
   HTTPS_PROXY=http://your-proxy:port
   NO_PROXY=localhost,127.0.0.1
   ```
3. Uji Konektivitas Jaringan:
   ```bash
   ping firestore.googleapis.com
   ping firebase.googleapis.com
   ```
4. Verifikasi Izin Service Account:
   Pastikan service account memiliki peran:
   - Cloud Firestore Admin
   - Firebase Authentication Admin
   - Storage Object Admin

### Masalah Firebase Storage Bucket Tidak Ditemukan (Error 404)
Jika terjadi kegagalan upload dengan pesan "The specified bucket does not exist", pastikan bucket Storage telah dibuat di Firebase Console:

1. Buka Firebase Console > Storage
2. Klik "Get Started", pilih lokasi (misal: asia-southeast1 untuk regional terdekat), dan aktifkan dalam mode pengujian (test mode) terlebih dahulu.
3. Jika nama bucket berbeda dari nama default, sesuaikan nilai `FIREBASE_STORAGE_BUCKET` di file `.env` dan restart server backend.

### Perbaikan Sistem Unggah Foto Profil (Profile Upload Fixes)
Pembaruan berikut telah diterapkan untuk mengatasi kegagalan pada fitur pembaruan foto profil:
1. **Konversi Base64 di Sisi Klien**: Komponen profile Next.js tidak lagi mengirimkan data FormData biner biasa melainkan melakukan pembacaan file secara asinkron menggunakan FileReader dan mengirimkannya sebagai payload JSON dengan data base64 ke endpoint `/api/media/upload`.
2. **Pelonggaran Guard pada Upload**: Endpoint `/api/media/upload` di NestJS tidak lagi dibatasi hanya untuk admin, melainkan dapat diakses oleh semua pengguna yang terautentikasi (authenticated users).
3. **Logika Retry Unggah**: Backend akan mencoba mengunggah foto ke Storage sebanyak maksimal 2 kali jika terjadi kegagalan pertama. Jika kedua percobaan gagal, backend tidak akan mengalami crash melainkan mengembalikan respons JSON clean:
   ```json
   {
     "profile_upload": "failed",
     "error": "unknown_system_error"
   }
   ```
