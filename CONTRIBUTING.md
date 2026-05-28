# Panduan Kontribusi
Last updated: 21 Mei 2026

Dokumen ini menjelaskan prosedur yang harus diikuti oleh seluruh anggota tim yang ingin berkontribusi pada codebase NEWGAME.

---

## Persiapan Lingkungan Pengembangan

Pastikan Node.js versi 18 atau lebih tinggi sudah terpasang. Akses ke proyek Firebase diperlukan untuk menjalankan sistem secara lokal. Minta kredensial yang dibutuhkan dari admin tim.

```bash
git clone https://github.com/rannymphaea/web-ua-newgame.git
cd web-unandnewgame
npm install --legacy-peer-deps
```

Setelah instalasi selesai, salin file `.env.example` ke `.env` untuk konfigurasi backend, dan buat file `.env.local` di dalam folder `apps/web` untuk konfigurasi frontend. Minta file `serviceAccountKey.json` dari admin dan tempatkan di root proyek. Jalankan inisialisasi data awal dengan perintah `cd apps/api && node src/scripts/seed-members.js`.

```bash
npm run dev
```

Buka http://localhost:3000 untuk memverifikasi bahwa sistem berjalan dengan benar.

---

## Alur Kerja Kontribusi

Seluruh perubahan harus dilakukan melalui branch terpisah, tidak langsung ke `main`. Buat branch baru dari `main` yang terbaru:

```bash
git checkout main
git pull origin main
git checkout -b feature/nama-fitur
```

Kerjakan perubahan pada branch tersebut. Pastikan panduan di [STYLE_GUIDE.md](STYLE_GUIDE.md) diikuti secara konsisten. Sebelum melakukan commit, verifikasi bahwa proses build berhasil:

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

## Aturan yang Wajib Dipatuhi

Jangan pernah melakukan push langsung ke branch `main`. Seluruh perubahan harus melalui Pull Request untuk memastikan proses tinjauan berjalan dengan benar.

Jangan pernah menyertakan file `serviceAccountKey.json`, `.env`, atau `.env.local` dalam commit. File-file ini sudah terdaftar di `.gitignore` dan tidak boleh masuk ke repository dalam kondisi apapun.

Jangan menggunakan emoji dalam kode. Gunakan ikon SVG sebagai alternatif untuk elemen visual dalam antarmuka.

Pastikan proses build pada kedua aplikasi berhasil sebelum membuat Pull Request. CI yang gagal akan menghambat proses tinjauan.

Dokumentasikan perubahan yang signifikan dengan memperbarui file `CHANGELOG.md` yang relevan.

---

## Referensi

Untuk memahami struktur dan arsitektur codebase secara menyeluruh, baca [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md). Panduan konvensi penulisan kode tersedia di [STYLE_GUIDE.md](STYLE_GUIDE.md). Jika ada pertanyaan yang tidak terjawab oleh dokumen-dokumen tersebut, hubungi admin melalui grup komunikasi tim.
