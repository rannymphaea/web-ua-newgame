# Panduan Registrasi dan Manajemen Anggota â€” NEWGAME v0.1.1

Dokumen ini adalah referensi operasional untuk pengurus dan admin platform NEWGAME v0.1.1. Berisi data keanggotaan aktif, format kode akses, dan tutorial lengkap untuk menambahkan anggota baru baik satu per satu maupun secara massal.

> [!CAUTION]
> Dokumen ini bersifat INTERNAL. Jangan dibagikan ke grup publik atau platform terbuka. Bagikan kode akses secara pribadi kepada masing-masing anggota.

---

### Format Identitas Anggota

Setiap anggota memiliki dua kredensial wajib yang diberikan saat orientasi:

| Kredensial | Format | Contoh | Keterangan |
|---|---|---|---|
| Member ID | `NEWGAME-XXX` | `NEWGAME-001` | Nomor urut tiga digit. Huruf kapital, case-sensitive. |
| Kode Akses | `temp-sec-XXX` | `temp-sec-283` | Angka acak tiga digit. Sekali pakai, hangus setelah digunakan. |

Aturan format:

- Member ID selalu menggunakan huruf kapital: `NEWGAME-`, bukan `newgame-`.
- Nomor urut dimulai dari `001` dan bertambah secara berurutan.
- Kode akses menggunakan angka acak yang tidak mengikuti pola urutan untuk alasan keamanan.
- Setelah anggota berhasil mendaftar, Kode Akses dianggap hangus dan tidak perlu disimpan ulang.

---

### Data Anggota Aktif

Tabel ini berisi daftar anggota yang telah atau sedang dalam proses pendaftaran. Perbarui tabel setiap kali ada penambahan anggota baru.

> [!NOTE]
> Kolom Status menggunakan nilai: `Belum Daftar` (kode akses belum digunakan), `Aktif` (sudah berhasil login), atau `Nonaktif` (akun dinonaktifkan oleh admin).

| No | Member ID | Nama Lengkap | Divisi | Role | Kode Akses | Status |
|---|---|---|---|---|---|---|
| 001 | NEWGAME-001 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-101 | Belum Daftar |
| 002 | NEWGAME-002 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-204 | Belum Daftar |
| 003 | NEWGAME-003 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-317 | Belum Daftar |
| 004 | NEWGAME-004 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-422 | Belum Daftar |
| 005 | NEWGAME-005 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-539 | Belum Daftar |
| 006 | NEWGAME-006 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-648 | Belum Daftar |
| 007 | NEWGAME-007 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-751 | Belum Daftar |
| 008 | NEWGAME-008 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-863 | Belum Daftar |
| 009 | NEWGAME-009 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-974 | Belum Daftar |
| 010 | NEWGAME-010 | (isi nama) | (isi divisi) | TRAINEE | temp-sec-185 | Belum Daftar |

Cara mengisi tabel ini: ganti kolom nama dan divisi dengan data nyata setiap anggota. Tambahkan baris baru mengikuti pola yang sama setiap kali ada anggota baru bergabung.

---

### Daftar Divisi yang Tersedia

| Kode Divisi | Nama Divisi |
|---|---|
| `game-dev` | Game Development |
| `art` | Seni dan Desain Visual |
| `programming` | Pemrograman dan Sistem |
| `sound` | Desain Suara dan Musik |
| `narrative` | Penulisan Narasi dan Cerita |
| `management` | Manajemen dan Operasional |

---

### Cara Menambahkan Anggota Baru (Satu per Satu)

#### Melalui Portal Admin

Langkah ini dilakukan melalui antarmuka halaman admin di portal NEWGAME v0.1.1.

Langkah 1 â€” Login ke portal sebagai akun dengan role ADMIN atau OWNER.

Langkah 2 â€” Buka halaman Admin Panel dan pilih menu "Kelola Anggota" atau navigasikan langsung ke `/dashboard/admin/members`.

Langkah 3 â€” Klik tombol "Tambah Anggota Baru".

Langkah 4 â€” Isi formulir dengan data berikut:

| Field | Nilai | Keterangan |
|---|---|---|
| Nama Lengkap | Nama asli anggota | Contoh: `Budi Santoso` |
| Email | Email aktif anggota | Akan diverifikasi saat login pertama |
| Member ID | `NEWGAME-XXX` | Sesuai urutan yang belum terpakai |
| Divisi | Pilih dari dropdown | Sesuai daftar divisi di atas |
| Role | TRAINEE | Default untuk anggota baru |
| Kode Akses | `temp-sec-XXX` | Buat angka acak yang belum digunakan |

Langkah 5 â€” Klik "Simpan". Sistem akan menulis data ke PostgreSQL dan melakukan dual-write ke Firestore sebagai backup.

Langkah 6 â€” Catat Member ID dan Kode Akses yang digunakan, lalu perbarui tabel di dokumen ini.

Langkah 7 â€” Sampaikan Member ID dan Kode Akses kepada anggota secara pribadi (direct message atau tatap muka langsung). Jangan kirim melalui grup chat yang dapat dilihat orang lain.

---

### Cara Menambahkan Anggota Baru (Import Massal)

Jika ada banyak anggota baru sekaligus (misalnya awal tahun ajaran), gunakan fitur import massal.

#### Format CSV

Buat file `.csv` menggunakan format berikut. Baris pertama adalah header dan tidak boleh diubah:

```csv
name,email,username,division,role,memberId,status,notes
Budi Santoso,budi@email.com,budisant,game-dev,TRAINEE,NEWGAME-011,active,Anggota baru 2026
Ani Putri,ani@email.com,aniputri,art,TRAINEE,NEWGAME-012,active,Anggota baru 2026
Reza Maulana,reza@email.com,rezaml,programming,TRAINEE,NEWGAME-013,active,Anggota baru 2026
```

Aturan CSV:
- Pisahkan kolom dengan koma tanpa spasi ekstra.
- Nilai role harus salah satu dari: TRAINEE, ASSOCIATE, TRAINER, SOLDAT, ADMIN, OWNER.
- Nilai status harus `active` atau `inactive`.
- Kolom notes bersifat opsional dan boleh dikosongkan.

#### Format JSON

```json
[
  {
    "name": "Budi Santoso",
    "email": "budi@email.com",
    "username": "budisant",
    "division": "game-dev",
    "role": "TRAINEE",
    "memberId": "NEWGAME-011",
    "status": "active",
    "notes": "Anggota baru 2026"
  },
  {
    "name": "Ani Putri",
    "email": "ani@email.com",
    "username": "aniputri",
    "division": "art",
    "role": "TRAINEE",
    "memberId": "NEWGAME-012",
    "status": "active",
    "notes": "Anggota baru 2026"
  }
]
```

#### Cara Mengirim File Import ke Sistem

Melalui Portal Admin:
1. Buka menu "Import Anggota" di halaman admin.
2. Pilih format CSV atau JSON.
3. Upload file atau paste konten langsung di kolom yang tersedia.
4. Klik "Proses Import".
5. Sistem akan menampilkan laporan: berapa data berhasil dibuat dan berapa yang gagal.

Melalui API (untuk developer):

```bash
curl -X POST https://api.unandnewgame.vercel.app/api/members/import \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "data": "[{\"name\":\"Budi Santoso\",\"email\":\"budi@email.com\",\"memberId\":\"NEWGAME-011\",\"division\":\"game-dev\",\"role\":\"TRAINEE\",\"status\":\"active\"}]"
  }'
```

Respons yang diharapkan:

```json
{
  "success": true,
  "data": {
    "created": 1,
    "failed": 0,
    "errors": []
  }
}
```

---

### Cara Mengubah Role Anggota

Role anggota dapat diubah melalui portal admin atau API. Hanya akun dengan role ADMIN atau OWNER yang dapat melakukan ini.

Melalui Portal Admin:
1. Buka halaman detail anggota di menu "Kelola Anggota".
2. Klik tombol "Ubah Role".
3. Pilih role baru dari dropdown.
4. Klik "Simpan Perubahan".

Melalui API:

```bash
curl -X POST https://api.unandnewgame.vercel.app/api/auth/set-role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "cuid-user-target",
    "role": "ASSOCIATE"
  }'
```

Batasan pergantian role:
- ADMIN hanya dapat mengubah role anggota ke TRAINEE hingga SOLDAT.
- OWNER dapat mengubah role ke level manapun termasuk ADMIN.

---

### Cara Menonaktifkan Anggota

Anggota yang keluar dari UKM tidak dihapus dari database, melainkan dinonaktifkan (soft delete). Data dan riwayat aktivitas tetap tersimpan.

Melalui Portal Admin:
1. Buka halaman detail anggota.
2. Klik tombol "Nonaktifkan Anggota".
3. Konfirmasi tindakan.

Melalui API:

```bash
curl -X DELETE https://api.unandnewgame.vercel.app/api/members/MEMBER_UID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Cara Membuat Akun Admin Baru

Hanya OWNER yang dapat membuat akun admin baru.

```bash
curl -X POST https://api.unandnewgame.vercel.app/api/auth/register-admin \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin-baru@email.com",
    "password": "password-aman-minimal-8-karakter",
    "displayName": "Nama Admin Baru",
    "division": "management"
  }'
```

---

### Generate Kode Akses Baru

Gunakan potongan kode berikut untuk menghasilkan kode akses sementara secara acak:

```javascript
function generateAccessCode() {
  const num = Math.floor(100 + Math.random() * 900);
  return `temp-sec-${num}`;
}

console.log(generateAccessCode()); // Output: temp-sec-483
```

Untuk membuat banyak kode sekaligus:

```javascript
function generateBatchCodes(count) {
  const codes = new Set();
  while (codes.size < count) {
    const num = Math.floor(100 + Math.random() * 900);
    codes.add(`temp-sec-${num}`);
  }
  return [...codes];
}

console.log(generateBatchCodes(20));
```

---

### Pemecahan Masalah Admin

| Masalah | Penyebab | Solusi |
|---|---|---|
| Import gagal: Email already exists | Email yang di-import sudah terdaftar | Hapus baris dengan email duplikat dari file import, lalu coba lagi |
| Anggota tidak bisa login setelah didaftarkan | Member ID atau Kode Akses salah ketik | Cek tabel data anggota, konfirmasi nilai yang benar kepada anggota |
| Role tidak bisa diubah | Token admin tidak memiliki hak yang cukup | Pastikan akun yang digunakan memiliki role ADMIN atau OWNER |
| Anggota bisa mendaftar tapi tidak masuk dashboard | Email belum diverifikasi (untuk login manual) | Minta anggota cek folder Spam/Junk di emailnya |
| Kode akses sudah digunakan tapi anggota belum berhasil daftar | Error di tengah proses sehingga kode hangus tanpa akun terbuat | Reset kode akses di database melalui Firestore Console atau Prisma Studio, lalu berikan kode baru kepada anggota |
