# CHANGELOG

Log perubahan NEWGAME Platform. Format: tanggal, kategori, detail.

---

## 20 Mei 2026

### Landing Page — Redesign Total + Guidebook Integration
- Konten dari [guidebook](https://2b-eternity.github.io/test/) terintegrasi penuh
- Semua emoji dihapus, diganti dengan SVG icons konsisten (object `ICONS` di `data.ts`)
- Komponen dipecah jadi modular: `data.ts`, `ScrollReveal.tsx`, `landing.css`
- 12 section: Hero, Visi & Misi (combined), Main Core, 3 Pillar, Quest, Sistem EXP, Project Ideas, Stats, FAQ, CTA, Contact, Footer

### Konten Baru dari Guidebook
- **Main Core**: Pixel President, Code Commander, Quest Keeper, Gold Guardian
- **3 Pillar**: Game Logic, Game Design, Game Sound (dengan deskripsi lengkap)
- **Quest**: 4 divisi (Hubungan Masyarakat, Riset & Pengembangan, Event & Kompetisi, Media & Dokumentasi)
- **Sistem EXP**: Poin EXP, 5 Rank (Rookie → Mythic), Eligible Lomba
- **Project Ideas**: Alpha Project, Beta Project, GOTS (Game of The Semester)
- **Guidebook Link**: Tombol langsung ke https://2b-eternity.github.io/test/

### Animasi Premium
- Staggered text animation (judul NEWGAME huruf per huruf)
- Parallax scroll (background orbs bergerak saat scroll)
- Reveal-on-scroll: fade-up, slide-left, slide-right, scale-in
- Staggered reveal delays (elemen muncul berurutan)
- Animated counter (angka naik dari 0)
- Floating animation, glow pulse, hover effects

### UI/UX
- Visi & Misi digabung jadi 2 kolom (slide dari kiri dan kanan)
- Org-tree visual untuk Main Core dengan garis penghubung
- Color-coded pillar cards dengan top accent border
- Rank badges berwarna di section EXP
- Scroll indicator di hero section
- Responsive design untuk semua section

### File Baru
- `apps/web/src/app/landing/landing.css` — Styles khusus landing
- `apps/web/src/app/landing/components/data.ts` — Semua data & ikon
- `apps/web/src/app/landing/components/ScrollReveal.tsx` — Hooks animasi reusable

### File Diubah
- `apps/web/src/app/landing/page.tsx` — Rewrite total
- `apps/web/src/styles/globals.css` — Tambah animasi parallax, staggered text, directional reveals

---

## 17 Mei 2026

### Arsitektur
- Migrasi penuh dari HTML/JS/Firebase ke monorepo NestJS + Next.js
- Pembersihan 12,860 file lama (cloud functions, config deploy tidak terpakai)
- Setup workspace: apps/api (backend) + apps/web (frontend)

### Backend (16 Modul)
- AuthModule: login, register, verify-member, set-role
- UsersModule: dashboard stats, profile update, role management
- AttendanceModule: process scan, history, check, event attendance
- EventsModule: CRUD event, generate token, close event
- MembersModule: list, import
- XpModule: edit XP, history
- LeaveModule: request, approve, reject
- LogsModule: list, export
- AnomaliesModule: list, resolve
- NewsModule: CRUD, publish, archive, slider, tutorials
- MediaModule: upload, list, update, delete
- BadgesModule: 40+ badge, 20 kategori, 10 rarity, auto-check, manual award
- PillarLevelsModule: 3 pillar x 4 level, assign oleh admin
- NotificationsModule: placeholder (butuh FCM setup)
- ExportModule: CSV export attendance, members, users
- FirebaseModule: graceful fallback tanpa service account key

### Frontend (17 Halaman)
- /login: email + Google sign-in
- /dashboard: statistik, XP, level, streak, news slider, quick actions
- /scan: QR scanner dengan kamera
- /news: berita, blog, event, tutorial dengan embed YouTube
- /leaderboard: ranking XP dengan podium top 3
- /badges: badge collection dengan filter kategori, rarity glow, progress bar
- /profile: edit username, foto profil, nama lengkap
- /admin: kelola event, generate QR
- /admin/news: CRUD berita
- /admin/media: gallery media
- /admin/analytics: grafik XP distribution, stat cards, top 5, export CSV
- /members: direktori 125 anggota
- /logs: log aktivitas sistem
- /change-password: ganti password
- /landing: landing page publik dengan visi misi, 3 pillar, FAQ

### UI/UX
- Dark mode full
- Glassmorphism sidebar dengan gradient
- SVG icons (tanpa emoji)
- Skeleton loading
- Toast notification system (success, error, warning, info)
- Responsive mobile sidebar
- Brand color palette: merah, ungu, kuning, hijau
- Favicon logo NEWGAME di tab browser

### Keamanan
- FirebaseAuthGuard di semua endpoint
- RolesGuard untuk admin-only routes
- Firestore transaction untuk absensi (anti duplikat)
- QR token 12 detik (anti penyalahgunaan)
- Device fingerprint (anti multi-device)
- Anomaly detection otomatis

### Dokumentasi
- README.md: rebranded sebagai platform NEWGAME
- PENGENALAN.md: flowchart, struktur file, skema database
- DEVELOPER_GUIDE.md: panduan developer, apa boleh/tidak diubah
- NEED_TO_DO.md: setup manual + roadmap lengkap
- CHANGELOG.md: file ini

### Data
- Identitas organisasi NEWGAME dipertahankan
- 125 member dari 2 generasi, 3 pillar
- Visi misi organisasi terintegrasi di landing page
- Presiden Pixel sebagai role khusus di badge system

---

## 3 Mei 2026 (Update 2)

### Fitur Baru
- /members/[id]: halaman detail profil per member dengan stats, badges, pillar levels
- /calendar: kalender event dengan navigasi bulan dan daftar event mendatang
- AnnouncementBanner: banner pengumuman penting di dashboard (info/warning/urgent)
- Heatmap aktivitas mingguan di analytics dashboard
- Rank user ditampilkan di dashboard stat card
- Recent Activity section di dashboard
- Upcoming Events section di dashboard
- Daily Motivation widget di dashboard

### Landing Page
- Struktur organisasi (placeholder - ISI DATA)
- Testimoni anggota (placeholder - ISI DATA)
- Contact section dengan link Instagram, YouTube, Email (ISI LINK)

### Backend
- Rate limiting: 100 request/menit/IP tanpa dependency tambahan
- NEED_TO_DO.md: 10 item konfigurasi eksternal yang tidak bisa dilakukan dari kode

### UI/UX
- ErrorBoundary component untuk fallback saat crash
- Empty states di semua section (Upcoming Events, Recent Activity)
- Consistent error handling di semua halaman

### Build
- Backend: 16 modules, 0 errors
- Frontend: 18 pages (termasuk /members/[id] dynamic), 0 errors

---

## Format Penambahan Log Baru
Tambahkan entry baru di atas baris ini dengan format:
## [Tanggal]
### [Kategori]
- [Detail perubahan]
