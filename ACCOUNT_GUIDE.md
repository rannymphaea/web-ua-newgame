# Panduan Membuat Akun NEWGAME

> Dokumen ini menjelaskan cara mendaftar ke portal anggota NEWGAME Universitas Andalas.

---

## Syarat Sebelum Mendaftar

Kamu **HARUS sudah terdaftar** sebagai anggota oleh pengurus/admin terlebih dahulu.  
Admin akan memberikan dua hal ini saat kamu diterima sebagai anggota baru:

| Yang kamu terima | Contoh | Keterangan |
|---|---|---|
| **Member ID** | `NEWGAME-001` | Identitas unik kamu di sistem — huruf kapital, format tetap |
| **Kode Akses** | `temp-xyz123` | Password sementara 1 kali pakai, diberikan admin saat orientasi |

Jika kamu belum menerima keduanya, hubungi **Ketua / Admin** terlebih dahulu.

---

## Data yang Wajib Disiapkan

Siapkan semua ini **sebelum** membuka halaman daftar:

| # | Data | Wajib | Sumber | Contoh |
|---|---|---|---|---|
| 1 | **Member ID** | ✅ | Diberikan admin | `NEWGAME-001` |
| 2 | **Kode Akses** | ✅ | Diberikan admin | `kode-sementara` |
| 3 | **Nama Lengkap** | ✅ | Data dirimu | `Budi Santoso` |
| 4 | **Email** | ✅ | Email aktif milikmu | `budi@gmail.com` |
| 5 | **Password Baru** | ✅ | Dibuat sendiri | Min. 6 karakter |

> [!IMPORTANT]
> **Kode Akses hanya bisa dipakai sekali.** Setelah berhasil daftar, kode itu tidak bisa dipakai lagi.  
> **Member ID bersifat case-sensitive** — ketik persis sesuai yang diberikan admin (termasuk huruf kapital dan tanda hubung).

---

## Langkah Membuat Akun

### Langkah 1 — Buka Halaman Daftar

1. Buka browser → kunjungi: **https://unandnewgame.vercel.app**
2. Klik tombol **"Masuk ke Portal"** di halaman utama
3. Di halaman login, klik tab **"Daftar"**

---

### Langkah 2 — Isi Form Pendaftaran

Isi **5 kolom** berikut secara berurutan:

| Kolom | Isi dengan | Catatan |
|---|---|---|
| **Nama Lengkap** | Nama lengkap kamu | Boleh berbeda dari nama di sistem |
| **Member ID** | Kode ID dari admin | Contoh: `NEWGAME-001` — huruf kapital |
| **Kode Akses** | Password sementara dari admin | 1 kali pakai |
| **Email** | Email aktif yang akan dipakai login | Harus bisa menerima email verifikasi |
| **Password Baru** | Password yang kamu buat sendiri | Minimal **6 karakter** |

Klik **"Daftar"** setelah semua kolom terisi.

---

### Langkah 3 — Verifikasi Email

Setelah klik **"Daftar"**:

1. Cek inbox email yang kamu daftarkan
2. Cek juga folder **Spam / Promotions** jika tidak ada di inbox
3. Klik link **verifikasi** dari Firebase / NEWGAME
4. Kembali ke halaman login

> [!WARNING]
> Kamu **tidak bisa login** sebelum email terverifikasi.

---

### Langkah 4 — Login

1. Buka tab **"Masuk"**
2. Isi **Email** dan **Password** yang kamu buat tadi
3. Klik **"Masuk"**
4. Kamu akan diarahkan ke **Dashboard**

**Atau** — klik **"Lanjutkan dengan Google"** untuk login lebih cepat (tanpa perlu ingat password).

---

## Jika Ada Masalah

| Pesan Error | Penyebab | Solusi |
|---|---|---|
| `Member ID tidak ditemukan` | Member ID salah ketik atau belum terdaftar | Cek ejaan, pastikan huruf kapital benar |
| `Password sementara salah` | Kode Akses tidak sesuai | Hubungi admin untuk minta kode ulang |
| `Member ID sudah terdaftar` | Akun sudah pernah dibuat | Coba login atau hubungi admin |
| `Please verify your email` | Email belum diklik verifikasi | Cek inbox / spam, klik link verifikasi |
| Email verifikasi tidak masuk | Bisa masuk spam atau typo email | Cek spam; jika email salah hubungi admin |
| Lupa password setelah daftar | — | Hubungi admin untuk reset |

---

## Alternatif Login — Google

Tersedia tombol **"Lanjutkan dengan Google"** di bawah form login.  
Pastikan akun Google yang kamu pilih sudah terdaftar di sistem (hubungi admin jika ragu).

---

## Untuk Admin: Cara Menambahkan Member Baru

Sebelum anggota bisa daftar, admin harus membuat dokumen di Firestore:

```
Collection : members
Document ID: <Member ID>   → contoh: NEWGAME-001

Fields wajib:
  memberId:     "NEWGAME-001"        ← harus sama dengan Document ID
  name:         "Nama Lengkap Member"
  division:     "Programming"        ← sesuaikan divisi
  status:       "active"
  tempPassword: "kode-akses-rahasia" ← berikan langsung ke anggota
  isRegistered: false                ← JANGAN diubah manual, sistem akan update otomatis

Fields opsional:
  team:         "Alpha"
```

Setelah anggota berhasil daftar, sistem akan otomatis set:
```
  isRegistered:    true
  registeredUserId: "<firebase-uid>"
  registeredAt:    <Timestamp>
```

> [!WARNING]
> Jangan pernah commit `tempPassword` ke GitHub atau bagikan secara publik.  
> Berikan kode akses langsung ke anggota baru secara personal (chat pribadi / tatap muka).

---

## Catatan Penting

- Login menggunakan **Email + Password** (bukan Member ID)
- Member ID hanya dipakai **sekali** saat registrasi untuk verifikasi identitas
- Setelah berhasil daftar, simpan email dan password dengan baik
- Gunakan **Google Login** untuk login lebih cepat tanpa perlu ingat password
- Jika akun **suspended**, hubungi admin — login akan otomatis ditolak

---

*Dokumen ini dikelola oleh Tim Admin NEWGAME Universitas Andalas*
