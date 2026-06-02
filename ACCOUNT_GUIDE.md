# Panduan Pendaftaran Akun NEWGAME V2

Dokumen ini memandu Anda (anggota baru) untuk mendaftar dan masuk ke portal **NEWGAME V2** Universitas Andalas menggunakan sistem autentikasi modern terpadu.

---

## 📋 Syarat Sebelum Mendaftar

Anda **HARUS sudah terdaftar secara resmi** di basis data UKM oleh admin/pengurus. 
Sebelum membuka halaman registrasi, pastikan Anda telah mendapatkan dua kredensial berikut dari pengurus/admin saat orientasi:

| Kredensial | Format Contoh | Keterangan |
|---|---|---|
| **Member ID** | `NEWGAME-042` | Identitas unik Anda di dalam sistem (Huruf Kapital, Case-Sensitive). |
| **Kode Akses** | `temp-sec-772` | Sandi sementara sekali pakai untuk memverifikasi keanggotaan Anda. |

> [!IMPORTANT]
> **Kode Akses hanya dapat digunakan tepat satu kali.** Setelah Anda berhasil menautkan akun, Kode Akses tersebut otomatis hangus demi alasan keamanan.

---

## ⚡ Langkah Melakukan Registrasi Anggota

### Langkah 1: Kunjungi Halaman Registrasi
1. Buka browser dan arahkan ke alamat production: **https://unandnewgame-tan.vercel.app** (atau `http://localhost:3000` di lingkungan lokal).
2. Klik tombol **"Masuk ke Portal"**.
3. Pada halaman autentikasi, beralihlah ke tab **"Daftar"** (Register).

### Langkah 2: Verifikasi Keanggotaan (Member Validation)
Sebelum membuat akun digital, sistem akan memeriksa kecocokan data Anda:
1. Masukkan **Member ID** Anda persis seperti yang diberikan admin.
2. Masukkan **Kode Akses** sementara.
3. Klik tombol **"Verifikasi Anggota"**. Jika berhasil, sistem akan menampilkan nama lengkap Anda beserta divisi yang ditetapkan pengurus.

### Langkah 3: Membuat Akun & Menautkan Autentikasi
Setelah data terverifikasi, Anda memiliki dua cara mudah untuk membuat akun login permanen:

#### Pilihan A: Lanjutkan dengan Google OAuth (Sangat Direkomendasikan)
1. Klik tombol **"Lanjutkan dengan Google"** (atau logo Google).
2. Pilih akun Google Kampus Anda yang aktif.
3. Sistem akan otomatis membuat akun yang aman, menautkan profil ke Member ID Anda, dan langsung mengarahkan Anda masuk ke Dashboard. Anda tidak perlu lagi menghafal password terpisah!

#### Pilihan B: Pendaftaran Manual (Email + Password Baru)
1. Masukkan **Email aktif** Anda yang sering digunakan.
2. Buat **Password Baru** yang aman (minimal 8 karakter, mengandung huruf dan angka).
3. Klik **"Daftar"**.
4. Cek kotak masuk (Inbox) atau folder **Spam/Promosi** pada email Anda, lalu klik tautan **Verifikasi Email** yang dikirimkan oleh sistem.
5. Kembali ke halaman portal, masuk ke tab **"Masuk"**, lalu login menggunakan email dan password baru Anda.

---

## 🛡️ Panduan Pengurus: Cara Menambahkan Anggota Baru

Agar anggota baru dapat melakukan registrasi di atas, admin wajib menambahkan data mereka terlebih dahulu. 

### Alur V2 (PostgreSQL via Admin Panel)
Admin dapat mendaftarkan anggota baru langsung melalui halaman admin di portal, yang otomatis menulis ke database PostgreSQL (dan melakukan dual-write ke Firestore as fallback):

```
Table: users & user_profiles
- id          : CUID otomatis
- email       : Email anggota (akan diisi otomatis setelah mereka login/daftar)
- displayName : "Nama Lengkap Anggota"
- memberId    : "NEWGAME-XXX"
- role        : "MEMBER" (Trainee/Associate/Trainer/Soldat/Admin)
- status      : "ACTIVE"
- tempPassword: "kode-akses-rahasia"
```

> [!WARNING]
> JANGAN PERNAH menyebarkan kode akses sementara ini secara publik di grup WhatsApp atau chat room terbuka. Kirimkan secara pribadi (direct message) atau berikan langsung secara tatap muka saat sesi orientasi anggota baru.

---

## 🔍 Solusi Pemecahan Masalah (Troubleshooting)

| Masalah / Pesan Error | Kemungkinan Penyebab | Langkah Solusi |
|---|---|---|
| `Member ID tidak ditemukan` | 1. Ada typo penulisan.<br>2. Admin belum menginput data Anda. | Pastikan huruf kapital benar (misal: `NEWGAME-001` bukan `newgame-001`). Hubungi admin jika masih gagal. |
| `Kode akses salah` | Kode akses sementara tidak cocok. | Mintalah kode akses baru secara personal kepada admin divisi Anda. |
| `Member ID sudah terdaftar` | Akun Anda sudah terdaftar sebelumnya. | Beralihlah ke tab **"Masuk"** dan coba login dengan Google atau gunakan fitur Lupa Password. |
| Email verifikasi tidak diterima | Email masuk folder spam atau ada kesalahan penulisan alamat email. | Cek folder **Spam/Junk**. Jika terdapat kesalahan penulisan email saat registrasi, minta admin untuk me-reset data pendaftaran Anda. |
| Login Google ditolak | Akun Google Anda tidak diotorisasi atau belum terdaftar di redirect URI. | Pastikan Anda masuk menggunakan email yang sesuai dengan data keanggotaan. Jika dalam localhost, pastikan file `.env` API terisi dengan Google OAuth Client ID yang valid. |
