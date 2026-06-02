# Panduan Akun — NEWGAME V1.1

Dokumen ini memandu anggota baru untuk mendaftar dan masuk ke portal NEWGAME V1.1 Universitas Andalas.

---

### Syarat Sebelum Mendaftar

Anda wajib sudah terdaftar secara resmi oleh admin atau pengurus di dalam sistem sebelum membuka halaman registrasi. Pastikan Anda telah menerima dua kredensial berikut dari pengurus saat orientasi:

| Kredensial | Format Contoh | Keterangan |
|---|---|---|
| Member ID | `NEWGAME-042` | Identitas unik Anda di sistem. Huruf kapital, case-sensitive. |
| Kode Akses | `temp-sec-772` | Sandi sementara sekali pakai untuk memverifikasi keanggotaan. |

> [!IMPORTANT]
> Kode Akses hanya dapat digunakan tepat satu kali. Setelah berhasil menautkan akun, kode tersebut otomatis hangus demi keamanan.

---

### Langkah Registrasi Anggota

#### Langkah 1 — Buka Halaman Registrasi

1. Kunjungi portal di `https://unandnewgame-tan.vercel.app` (atau `http://localhost:3000` di lingkungan lokal).
2. Klik tombol "Masuk ke Portal".
3. Pada halaman autentikasi, pilih tab "Daftar".

#### Langkah 2 — Verifikasi Keanggotaan

1. Masukkan Member ID Anda persis seperti yang diberikan pengurus, contoh: `NEWGAME-042`.
2. Masukkan Kode Akses sementara.
3. Klik "Verifikasi Anggota". Jika berhasil, sistem menampilkan nama lengkap dan divisi Anda.

#### Langkah 3 — Buat Akun Login Permanen

Setelah verifikasi berhasil, pilih salah satu cara berikut:

Pilihan A — Lanjutkan dengan Google (Direkomendasikan)

1. Klik tombol "Lanjutkan dengan Google".
2. Pilih akun Google aktif Anda, diutamakan akun kampus.
3. Sistem membuat akun secara otomatis, menautkan profil ke Member ID Anda, dan langsung mengarahkan ke Dashboard.

Pilihan B — Daftar Manual (Email dan Password)

1. Masukkan email aktif Anda.
2. Buat password baru yang kuat (minimal 8 karakter, gabungan huruf dan angka).
3. Klik "Daftar".
4. Cek inbox atau folder Spam/Promosi pada email Anda, lalu klik tautan Verifikasi Email yang dikirimkan sistem.
5. Kembali ke portal, pilih tab "Masuk", lalu login menggunakan email dan password baru.

---

### Panduan Admin — Menambahkan Anggota Baru

Sebelum anggota dapat mendaftar, admin wajib mendaftarkan data mereka terlebih dahulu. Lihat panduan lengkap di [MEMBER_REGISTRATION.md](./MEMBER_REGISTRATION.md).

---

### Pemecahan Masalah

| Pesan Error | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Member ID tidak ditemukan | Typo penulisan atau admin belum menginput data | Pastikan huruf kapital benar, contoh: `NEWGAME-001` bukan `newgame-001`. Hubungi admin jika masih gagal. |
| Kode akses salah | Kode tidak cocok atau sudah digunakan | Minta kode akses baru secara personal kepada admin divisi. |
| Member ID sudah terdaftar | Akun sudah pernah dibuat sebelumnya | Beralih ke tab "Masuk" dan coba login dengan Google atau gunakan fitur Lupa Password. |
| Email verifikasi tidak diterima | Masuk folder spam atau ada kesalahan penulisan email | Cek folder Spam/Junk. Jika alamat email salah, minta admin reset data pendaftaran Anda. |
| Login Google ditolak | Akun Google tidak diotorisasi atau redirect URI belum dikonfigurasi | Pastikan login menggunakan email yang sesuai data keanggotaan. Di localhost, pastikan `.env` API berisi Google OAuth Client ID yang valid. |
