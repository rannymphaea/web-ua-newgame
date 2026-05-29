# CHANGELOG

Log perubahan dan riwayat sesi pengembangan platform web NEWGAME.

---

## Sesi 8 (29 Mei 2026) — Konsolidasi Dokumentasi dan Fitur Avatar

### Fitur Avatar dan Unggah Profil
- **Upload Foto Profil**: Penulisan ulang uploadProfile dengan mekanisme doUpload yang dicoba maksimal 2 kali. Jika gagal pada percobaan pertama, mencatat log upload_retry. Jika tetap gagal, mengembalikan status kegagalan tanpa menyebabkan server crash.
- **Dukungan Multi Avatar**: Menambahkan daftar avatar yang diizinkan (default, neko, chibi, yua) pada media service dan kontroler API.
- **Interaksi Avatar Yua**: Implementasi efek khusus saat memilih avatar yua, yang memicu sfx yua-select.mp3 dan animasi avatar_pulse (skala 1 ke 1.15 ke 1 dalam durasi maksimal 220ms dengan transisi ease-out).
- **Pembatasan Laju SFX (Cooldown)**: Menghindari spam suara dengan menambahkan jeda cooldown 600ms. Jika ditekan kembali selama cooldown, sistem memberikan respon cooldown_active.
- **Format JSON Bersih**: Seluruh endpoint avatar dan profil selalu mengembalikan respon JSON terstruktur.

### Konsolidasi Dokumen Markdown
- Menggabungkan README.md, PENGENALAN.md, dan NOTULENSI.md menjadi satu dokumen README.md yang komprehensif.
- Menggabungkan DEVELOPER_GUIDE.md, STYLE_GUIDE.md, CONTRIBUTING.md, dan dokumen panduan perbaikan (Firebase connection, Storage bucket, profile fix) menjadi satu file DEVELOPER_GUIDE.md.
- Menggabungkan SECURITY_CHECKLIST.md, SECURITY_HARDENING.md, THREAT_INTEL.md, dan FIRESTORE_RULES.md ke dalam satu file SECURITY.md.
- Menggabungkan CHANGELOG.md dan TRACKING.md menjadi satu file CHANGELOG.md.
- Menghapus semua emoji dari seluruh dokumen Markdown agar tampilan lebih profesional dan bersih.

---

## Sesi 7 — Integrasi Guidebook

### Kerja Sesi
- **Dashboard**: Menambahkan kartu banner Guidebook (ikon, judul, deskripsi, chip penanda, dan efek hover emas).
- **Landing Page**: Menambahkan seksi Guidebook NEWGAME sebelum CTA menggunakan transisi Framer Motion dan chip indikator.
- **Landing Hero**: Menambahkan tombol ketiga "Guidebook" untuk melakukan gulir otomatis ke bagian panduan.

---

## Sesi 6 — Optimalisasi Performa

### Masalah Awal
- Waktu muat halaman pertama melebihi 3 detik.
- Remix Icon CSS menghalangi proses render awal (render-blocking).
- Autentikasi Firebase menyebabkan layar kosong / pemutar berputar (spinner) selama 1-3 detik.
- Panggilan API simultan sebelum halaman siap ditampilkan.
- Pemuatan font tebal di semua halaman dashboard.

### Solusi yang Diterapkan
- **Pemuatan Optimistik pada Auth Store**: Memanfaatkan cache IndexedDB Firebase agar status login dapat dimuat secara instan tanpa menunggu siklus penuh auth state.
- **Tata Letak Dashboard Lebih Ringan**: Menghapus pemutar layar penuh dan menggantinya dengan skeleton loading untuk mempercepat transisi.
- **Sumber Daya Non-Blocking**: Memuat CSS Remix Icon secara asinkron dan menghapus font Cormorant serta Pinyon dari dashboard untuk menghemat ukuran bundle.
- **Dua Fase Pemuatan Dashboard**: Fase pertama menampilkan data dasar secara instan dari Zustand, fase kedua mengambil data eksternal secara bertahap setelah halaman pertama selesai digambar.
- **Konfigurasi Next.js**: Mengoptimalkan impor pustaka eksternal (framer-motion, zustand, sub-modul Firebase) dan mengaktifkan kompresi format gambar AVIF/WebP dengan waktu simpan (TTL) cache yang dioptimalkan.

---

## Sesi 5 — Penyesuaian Tata Letak Dashboard dan XP Bar

### Kerja Sesi
- Mengembalikan desain dashboard ke tata letak awal menggunakan ilustrasi karakter utama.
- **TopBar**: Menambahkan visualisasi bar tingkat pengalaman (XP liquid bar) setinggi 30px secara horizontal, lengkap dengan animasi gelombang SVG dan perubahan warna otomatis sesuai tingkatan level user.

---

## Sesi 4 — Pengerasan Keamanan

### Kerja Sesi
- Menyusun modul keamanan NestJS (SecurityModule) yang mencakup pembatasan laju permintaan, pelindung token JWT, penyaring input, CORS, dan tajuk keamanan (Helmet).
- Menyiapkan berkas stubs konfigurasi untuk pengerasan NGINX dan aturan ModSecurity WAF.
- Merancang fondasi awal pendeteksian anomali berbasis kecerdasan buatan.
- Menambahkan sistem pencatatan aktivitas forensic logs dan pengiriman peringatan keamanan.

---

## Sesi 3 — Landing Page Premium

### Kerja Sesi
- Mendesain ulang landing page dengan tata letak modern, animasi pengetikan teks, seksi visi misi, struktur pengurus, dan pengenalan divisi.
- Menambahkan visualisasi peta perjalanan keanggotaan (Pirate Map) dan presentasi kartu misi tiga dimensi.
- Menambahkan efek suara interaktif, modal pemutaran video profil, dan latar belakang tekstur kertas.

---

## Sesi 2 — Antarmuka Halaman Dashboard dan Pengguna

### Kerja Sesi
- Membuat halaman login yang terintegrasi dengan Firebase Auth.
- Implementasi halaman utama dashboard anggota, pemindaian QR absensi, daftar lencana, dan peringkat keaktifan.
- Menyusun halaman administrasi untuk pengelolaan berita, berkas galeri media, dan analisis keaktifan anggota.

---

## Sesi 1 — Infrastruktur Dasar Monorepo

### Kerja Sesi
- Setup monorepo menggunakan Next.js (aplikasi web) dan NestJS (aplikasi API).
- Konfigurasi database Firestore dan Firebase Auth.
- Membuat modul sistem penanganan pesan kesalahan global dan manajemen tema visual aplikasi.

---

## Riwayat Rilis Sebelumnya

### 20 Mei 2026 (Landing Page & Integrasi Guidebook)
- Integrasi materi panduan dari guidebook resmi ke halaman web.
- Mengganti seluruh emoji pada antarmuka publik dengan ikon berbasis SVG.
- Membagi komponen landing page agar lebih modular untuk pemeliharaan yang lebih mudah.

### 17 Mei 2026 (Migrasi Monorepo)
- Migrasi penuh sistem lama berbasis HTML/JS mandiri ke monorepo terpadu.
- Menghapus lebih dari 12,000 berkas konfigurasi lama yang tidak terpakai.
- Menyusun 16 modul utama di backend API untuk menangani autentikasi, absensi, lencana, pilar keahlian, ekspor laporan, dan pendeteksian kecurangan.

### 3 Mei 2026 (Fitur Anggota & Kalender)
- Menambahkan halaman detail profil anggota beserta riwayat aktivitasnya.
- Menambahkan kalender kegiatan interaktif.
- Membuat banner pengumuman darurat di dashboard admin.
- Integrasi visualisasi grafik heatmap mingguan untuk analisis keaktifan anggota.
