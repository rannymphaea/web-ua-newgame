# Notulensi Akhir — Pengembangan Platform NEWGAME

**Tanggal:** 27 Mei 2026  
**Proyek:** NEWGAME Web Platform — UKM Game Development Universitas Andalas  
**Status:** ✅ Fase Pertama Selesai

---

## Ringkasan Singkat

Platform web NEWGAME adalah portal komunitas game developer mahasiswa Universitas Andalas. Sistem ini menggabungkan absensi berbasis QR code, gamifikasi (XP, level, badge), manajemen berita, leaderboard, dan halaman landing publik. Seluruh infrastruktur frontend (Next.js) dan backend (NestJS) telah berhasil dibangun dan dioptimasi dalam satu sesi pengembangan panjang.

---

## Keputusan Desain

### Arsitektur
- **Monorepo** dipilih untuk kemudahan berbagi tipe dan dependensi antara `apps/web` dan `apps/api`
- **Firebase** digunakan untuk Auth dan Firestore karena sudah familiar di tim dan menyediakan real-time listener
- **Zustand** untuk state management — lebih ringan dari Redux, cukup untuk kebutuhan aplikasi ini
- **Next.js App Router** dengan `use client` di komponen interaktif

### Desain Visual
- Tema gelap sebagai default, dengan toggle light mode
- Palet warna: gold (`#FDCF41`) sebagai aksen utama, latar gelap `#0D1117`
- Font: Inter (UI), Lora (heading), Cormorant Garamond (landing page), Pinyon Script (dekoratif)
- Karakter animasi (`oc-main.png`, `oc-hero.png`, dll.) sebagai maskot interaktif
- NovelCursor dipertahankan sebagai dekorasi, bukan cursor fungsional

### XP & Gamifikasi
- Level dihitung sebagai `Math.floor(xpCache / 100) + 1`
- XP bar di TopBar: pill kompak 30px dengan liquid animation SVG
- Warna berubah per tier: Lv 1–5 cyan, Lv 6–15 purple, Lv 16–30 orange, Lv 31+ red
- Bar juga muncul di dalam hero card dashboard (compact)

---

## Perubahan Signifikan

### Revisi Dashboard (Sesi 5)
Sempat dibuat layout "retro-modern" dengan XP hero besar. User meminta dikembalikan ke tampilan asli. Pelajaran: konfirmasi mockup lebih dulu sebelum mengubah UI yang sudah ada.

### Optimasi Performa (Sesi 6)
Temuan terbesar: **Firebase auth adalah bottleneck utama**. Solusi optimistis menggunakan `auth.currentUser` sinkronus menghilangkan spinner 1–3 detik. Ini adalah perbaikan paling berdampak dari seluruh sesi.

Temuan kedua: **Remix Icon CSS bersifat render-blocking**. Satu baris perubahan `media="print"` menghilangkan resource blocker tanpa mengubah fungsionalitas apapun.

---

## Yang Belum Dikerjakan (Backlog)

| Item | Prioritas | Catatan |
|---|---|---|
| Notifikasi real-time | Tinggi | Firebase onSnapshot sudah di-stub |
| Upload avatar profil | Tinggi | Firebase Storage tersedia |
| Admin: kelola member | Sedang | CRUD endpoint belum lengkap |
| PQCrypto security layer | Rendah | Placeholder, butuh library external |
| Laravel API gateway | Rendah | Stub only per permintaan user |
| Push notification (PWA) | Rendah | manifest.json sudah ada |
| Dark mode landing page | Rendah | Landing masih light-only |
| Unit testing | Sedang | Belum ada test coverage |

---

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan frontend
npm run dev --workspace=apps/web
# → http://localhost:3000

# Jalankan backend
npm run dev --workspace=apps/api
# → http://localhost:3001
```

---

## Variabel Lingkungan yang Dibutuhkan

```env
# apps/web/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_URL=http://localhost:3001

# apps/api/.env
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
JWT_SECRET=...
```

---

## Catatan Teknis Penting

1. **`userData` tidak mengandung `uid`** — gunakan `user.uid` dari Firebase Auth untuk lookup Firestore
2. **`auth.currentUser`** tersedia sinkronus setelah Firebase diinisialisasi (dari IndexedDB cache) — manfaatkan ini untuk optimistic loading
3. **Cormorant Garamond & Pinyon Script** hanya diload di `/landing` — jangan ditambahkan ke global layout
4. **`window.location.href`** jangan digunakan untuk redirect — selalu pakai `router.replace()`
5. **`next/dynamic` + `ssr: false`** untuk komponen berat yang tidak perlu SSR (NewsSlider, QuestStack3D, dll.)

---

## Referensi

| Resource | URL |
|---|---|
| Platform NEWGAME | http://localhost:3000 |
| Guidebook NEWGAME | https://2b-eternity.github.io/test/ |
| Firebase Console | https://console.firebase.google.com |
| Remix Icon | https://remixicon.com |
| Dokumentasi Next.js | https://nextjs.org/docs |

---

*Dibuat oleh: Tim Pengembang NEWGAME*  
*Tanggal: 27 Mei 2026*
