# NEWGAME — Catatan Tugas dan Status Pengembangan
Last updated: 21 Mei 2026

---

## Status Persiapan Awal

Tiga tahap persiapan dasar sistem telah selesai dilakukan: konfigurasi Firebase Service Account Key, pengisian data awal anggota melalui script seed, dan verifikasi fungsionalitas login. Sistem backend dan frontend saat ini dapat berjalan secara normal di lingkungan lokal.

---

## Pengujian Sebelum Peluncuran

### Alur Absensi QR

Pengujian dilakukan dengan login menggunakan akun admin, membuat event baru melalui halaman /admin, kemudian memindai kode QR yang dihasilkan dari perangkat berbeda menggunakan halaman /scan. Setelah pemindaian berhasil, pastikan poin XP bertambah pada profil anggota yang memindai.

### Alur Publikasi Konten

Login menggunakan akun admin, akses halaman /admin/news, buat publikasi baru dengan menyertakan URL YouTube yang valid, kemudian verifikasi tampilan konten tersebut muncul dengan benar pada halaman /news di tab Tutorial.

### Indeks Firestore

Beberapa kueri yang menggabungkan lebih dari satu kondisi filter memerlukan composite index di Firestore. Indeks ini tidak perlu dibuat secara manual di awal. Pada saat error pertama kali muncul, Firebase akan memberikan tautan langsung ke halaman pembuatan indeks di Console. Klik tautan tersebut dan indeks akan dibuat otomatis.

---

## Status Deployment

Saat ini deployment ke Vercel ditahan secara sengaja. File `apps/web/vercel.json` berisi instruksi `ignoreCommand: exit 0` yang mencegah Vercel memulai proses build meskipun ada push baru ke GitHub.

Saat tim sudah siap untuk merilis ke production, langkah yang perlu dilakukan adalah menghapus file `apps/web/vercel.json`, memastikan seluruh environment variables telah diisi di Vercel Dashboard, lalu melakukan push ke repository. Vercel akan mendeteksi perubahan dan memulai deployment secara otomatis.

**Frontend ke Vercel:** Root directory yang digunakan adalah `apps/web`. Environment variables dapat disalin dari file `apps/web/.env.local`, dengan penambahan `NEXT_PUBLIC_API_URL` yang diisi dengan URL backend produksi.

**Backend ke Server:** Root directory yang digunakan adalah `apps/api`. Variabel `PORT`, `FIREBASE_PROJECT_ID`, dan `FIREBASE_STORAGE_BUCKET` perlu dikonfigurasi. Setelah backend berhasil di-deploy, nilai `FRONTEND_URL` di `apps/api/src/main.ts` harus diperbarui dengan URL domain frontend produksi.

---

## Verifikasi Keamanan

Pastikan file `serviceAccountKey.json` terdaftar di `.gitignore` dan tidak pernah masuk ke dalam repository. Tinjau aturan keamanan Firestore melalui Firebase Console untuk memastikan hanya pengguna yang terautentikasi yang dapat membaca dan menulis data. Lakukan pengujian bahwa anggota dengan peran `member` tidak dapat mengakses rute `/admin` maupun endpoint API yang memerlukan peran `admin`.

---

## Status Komponen Sistem

| Komponen | Status |
|----------|--------|
| Backend NestJS (16 modul) | Selesai, 0 error |
| Frontend Next.js (20 halaman) | Selesai, 0 error |
| Landing Page | Selesai, termasuk 6 komponen interaktif |
| Sistem Lencana | Selesai, 40+ lencana |
| Sistem Level Pilar | Selesai, 3 pilar x 4 level |
| Dasbor Analitik | Selesai, termasuk grafik dan ekspor CSV |
| CI GitHub Actions | Aktif dan dikonfigurasi untuk monorepo |
| Vercel Auto-deploy | Dinonaktifkan sementara via vercel.json |
| Deployment Production | Belum dilakukan |

---

## Konten yang Perlu Disesuaikan

### Logo Organisasi

File `apps/web/public/logo.png` saat ini menggunakan file sementara berukuran 19KB. Ganti dengan logo resmi NEWGAME dalam format PNG transparan dengan dimensi minimal 256x256 piksel.

### Logo Divisi

Setiap pilar memiliki field `logo` di dalam objek array `PILLARS` pada file `apps/api/src/modules/pillar-levels/pillar-definitions.ts`. Diperlukan tiga berkas gambar untuk pilar Game Logic, Game Design, dan Game Sound. Format PNG atau SVG disarankan.

### Nama Resmi Jabatan Pengurus Inti

Objek `MAIN_CORE` di dalam `apps/web/src/app/landing/components/data.ts` saat ini menggunakan nama peran generik seperti "Pixel President" dan "Code Commander". Isi dengan nama asli pemegang jabatan.

### Banner Pengumuman

Objek `FALLBACK_ANNOUNCEMENT` di `apps/web/src/components/ui/AnnouncementBanner.tsx` perlu diisi dengan konten pengumuman yang relevan untuk ditampilkan kepada anggota di halaman dashboard.

### Angka Statistik Landing Page

Array `STATS` di `apps/web/src/app/landing/components/data.ts` berisi angka statistik yang ditampilkan di halaman publik. Sesuaikan nilai `value` dan `suffix` dengan data organisasi yang sesungguhnya.

### Persyaratan Kenaikan Level Pilar

Field persyaratan (requirements) untuk naik dari satu level ke level berikutnya di `apps/api/src/modules/pillar-levels/pillar-definitions.ts` masih menggunakan teks cadangan. Isi dengan ketentuan yang ditetapkan oleh pengurus.

### Lencana Musiman

Jika tim ingin menambahkan lencana khusus untuk periode tertentu, tambahkan entri baru ke array `BADGES` di `apps/api/src/modules/badges/badge-definitions.ts`. Sertakan nama, deskripsi, periode, dan syarat untuk mendapatkan lencana tersebut.

---

## Konfigurasi Layanan Eksternal

**Firebase Cloud Messaging** dibutuhkan jika notifikasi push ke perangkat anggota ingin diaktifkan. Saat ini modul notifikasi sudah tersedia namun hanya mencatat permintaan ke log. Untuk mengaktifkannya, Server Key dari Firebase Console perlu dikonfigurasi sebagai variabel lingkungan di backend.

**CORS Firebase Storage** perlu dikonfigurasi melalui Google Cloud Console agar pengunggahan berkas dari browser tidak diblokir oleh kebijakan lintas asal. Konfigurasi ini hanya diperlukan saat fitur unggah media pertama kali digunakan di produksi.

Custom domain untuk antarmuka dapat dikonfigurasi secara opsional melalui menu Settings > Domains di Vercel Dashboard.

---

## Referensi Komponen Landing Page

File yang membentuk halaman publik dan boleh dimodifikasi:

| File | Fungsi |
|------|--------|
| landing/page.tsx | Struktur utama halaman, menggabungkan seluruh komponen |
| landing/landing.css | Pengaturan tata letak dan tampilan khusus halaman publik |
| landing/components/data.ts | Pusat seluruh data, teks, dan ikon yang ditampilkan |
| landing/components/ScrollReveal.tsx | Animasi yang dipicu saat elemen terlihat di layar |
| landing/components/PirateMap.tsx | Visualisasi alur keanggotaan dalam format gulungan peta |
| landing/components/QuestStack3D.tsx | Presentasi kartu misi dalam tampilan tiga dimensi |
| landing/components/AssessmentAccordion.tsx | Rincian sistem poin pengalaman dalam format akordeon |
| landing/components/VideoModal.tsx | Overlay modal untuk pemutaran video |
| landing/components/PaperCanvas.tsx | Efek tekstur visual latar belakang |
| landing/components/useKalimba.ts | Hook untuk interaksi audio pada halaman |
