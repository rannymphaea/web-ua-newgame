# Panduan Membuat Akun NEWGAME

> Dokumen ini menjelaskan cara mendaftar ke portal anggota NEWGAME Universitas Andalas.

---

## Syarat Sebelum Mendaftar

Kamu **HARUS sudah terdaftar** sebagai anggota oleh pengurus/admin terlebih dahulu.  
Admin akan memberikan dua hal ini saat kamu diterima sebagai anggota baru:

| Yang kamu terima | Keterangan |
|---|---|
| **Member ID** | Contoh: `NEWGAME-001` — identitas unik kamu di sistem |
| **Kode Akses** | Password sementara 1 kali pakai, diberikan admin saat orientasi |

Jika kamu belum menerima keduanya, hubungi **Ketua / Admin** terlebih dahulu.

---

## Langkah Membuat Akun

### Langkah 1 — Buka Halaman Daftar

1. Buka browser dan kunjungi: **https://unandnewgame.vercel.app**
2. Klik tombol **"Masuk ke Portal"** di halaman utama
3. Di halaman login, klik tab **"Daftar"**

---

### Langkah 2 — Isi Form Pendaftaran

Isi semua kolom berikut:

| Kolom | Isi dengan |
|---|---|
| **Nama Lengkap** | Nama kamu sesuai yang terdaftar di sistem |
| **Member ID** | Kode ID yang diberikan admin (contoh: `NEWGAME-001`) |
| **Kode Akses** | Password sementara dari admin |
| **Email** | Email yang akan kamu pakai untuk login |
| **Password** | Password baru yang kamu buat sendiri (min. 6 karakter) |

> [!IMPORTANT]
> **Kode Akses** hanya bisa dipakai **sekali**. Setelah berhasil daftar, kode itu tidak bisa dipakai lagi.

---

### Langkah 3 — Verifikasi Email

Setelah klik **"Daftar"**:
1. Cek inbox emailmu (dan folder **Spam/Promotions**)
2. Klik link verifikasi dari Firebase/NEWGAME
3. Kembali ke halaman login

---

### Langkah 4 — Login

1. Masuk ke tab **"Masuk"**
2. Isi Email dan Password yang kamu buat tadi
3. Klik **"Masuk"**
4. Kamu akan diarahkan ke Dashboard

---

## Jika Ada Masalah

| Masalah | Solusi |
|---|---|
| "Member ID tidak ditemukan" | Pastikan Member ID yang diketik sama persis (termasuk kapital) |
| "Kode Akses salah" | Minta ulang kode akses ke admin |
| "Member ID sudah terdaftar" | Akun kamu sudah dibuat sebelumnya. Coba login atau hubungi admin. |
| Email verifikasi tidak masuk | Cek folder Spam atau minta kirim ulang |
| Lupa password | Fitur reset password belum tersedia — hubungi admin |

---

## Untuk Admin: Cara Menambahkan Member Baru

Sebelum anggota bisa daftar, admin harus membuat data member di Firestore:

```
Collection: members
Document ID: <Member ID> (contoh: NEWGAME-001)

Fields:
  memberId:    "NEWGAME-001"
  name:        "Nama Lengkap Member"
  division:    "Programming" (atau divisi lain)
  team:        "Alpha" (opsional)
  status:      "active"
  tempPassword: "kode-akses-rahasia"
  isRegistered: false
```

> [!WARNING]
> Jangan pernah commit `tempPassword` ke GitHub atau bagikan secara publik.
> Berikan kode akses langsung ke anggota baru secara personal.

---

## Catatan Penting

- Login menggunakan **Email + Password** (bukan Member ID)
- Member ID hanya dipakai sekali saat **registrasi** untuk verifikasi identitas
- Setelah berhasil daftar, simpan email dan password kamu dengan baik
- Gunakan **Google Login** jika kamu ingin login lebih cepat (tanpa perlu ingat password)

---

*Dokumen ini dikelola oleh Tim Admin NEWGAME Universitas Andalas*
