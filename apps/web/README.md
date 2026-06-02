# NEWGAME V1.1 — Frontend Application

Dokumentasi teknis untuk aplikasi frontend Next.js 14 di direktori `apps/web/`. Mencakup fitur utama V1.1, spesifikasi desain, peta direktori, dan konfigurasi environment.

---

### Fitur Utama V1.1

Space Grotesk Typography — Font brand NEWGAME dimigrasikan ke Space Grotesk untuk tampilan modern dan keterbacaan tinggi di semua perangkat. Diintegrasikan langsung menggunakan `next/font/google` sehingga tidak ada permintaan jaringan tambahan saat runtime dan CLS (Cumulative Layout Shift) bernilai nol.

Interactive PirateMap — Komponen PirateMap.tsx dibangun ulang sepenuhnya menggunakan pure SVG interaktif dengan diagram pohon (left-to-right tree). Animasi stroke konektor berjalan secara staggered dan panel deskripsi muncul secara reaktif saat node di-hover.

Web Mobile Simulator — Halaman khusus internal developer di route `/dev-tools` untuk mempreview tampilan aplikasi pada berbagai ukuran layar ponsel. Menggunakan iframe dengan 8 preset perangkat, toggle orientasi, dan slider skala.

PostHog Observability — Terintegrasi penuh dengan PostHogProvider untuk perekaman pageview secara manual dan asinkron serta pelacakan event CTA tanpa memperlambat First Contentful Paint.

ErrorBoundary Resilience — Komponen ErrorBoundary membungkus seluruh layout utama. Jika terjadi error crash di sisi client, komponen ini menangkap error, mengirim laporan ke PostHog, dan menyediakan tombol retry tanpa perlu reload penuh.

---

### Spesifikasi Desain

#### Dark Mode

| Aspek | Detail |
|---|---|
| File konfigurasi | `src/lib/theme-engine.ts` |
| Mekanisme | Script inline anti-FOUC disisipkan di head sebelum rendering awal |
| Sumber preferensi | `localStorage.theme` atau preferensi media-query OS |
| Implementasi | Kelas `.dark` diterapkan pada elemen html |
| Aturan warna | Dilarang menggunakan hex/rgb hardcoded di komponen. Selalu gunakan `var(--clr-*)` |

#### Animasi CSS

Semua animasi diatur menggunakan pure CSS keyframes dengan `will-change` untuk akselerasi GPU:

| Kelas Animasi | Deskripsi | Durasi | Easing |
|---|---|---|---|
| `.animate-fade-in` | Transisi opacity masuk halus | 0.5s | ease |
| `.animate-slide-up` | Efek slide dari bawah ke atas | 0.4s | cubic-bezier(0.16, 1, 0.3, 1) |
| `.animate-float` | Animasi mengambang melingkar untuk ilustrasi | 4.0s | ease-in-out infinite |
| `.skeleton` | Efek shimmer gradien untuk status loading | 1.5s | ease-in-out infinite |

---

### Peta Direktori Frontend

```
apps/web/src/
├── app/
│   ├── layout.tsx                  # Entry layout utama, Space Grotesk dan PostHog init
│   ├── page.tsx                    # Redirect ke /landing
│   ├── dev-tools/                  # Web Mobile Simulator (internal developer)
│   ├── landing/                    # Landing page publik dengan PirateMap
│   └── (dashboard)/                # Portal terproteksi (Zustand auth store)
│       ├── dashboard/              # Halaman utama dashboard anggota
│       ├── leaderboard/            # Papan peringkat XP gamifikasi
│       ├── badges/                 # Koleksi lencana dan pencapaian
│       ├── attendance/             # Scan QR dan riwayat kehadiran
│       ├── news/                   # Artikel berita dan tutorial UKM
│       ├── profile/                # Profil dan riwayat aktivitas anggota
│       └── admin/                  # Panel manajemen (admin/owner only)
│
├── components/
│   ├── providers/
│   │   └── PostHogProvider.tsx     # Perekam otomatis navigasi pageview
│   ├── ui/
│   │   ├── ErrorBoundary.tsx       # Penahan crash runtime client-side
│   │   ├── ProfileCard.tsx         # Kartu informasi anggota (avatar dan detail)
│   │   ├── Toast.tsx               # Notifikasi pop-up ARIA live
│   │   └── ToggleDarkMode.tsx      # Tombol toggle tema gelap/terang
│   └── layout/
│       ├── Sidebar.tsx             # Sidebar dinamis hover-elastis, mobile responsive
│       └── TopBar.tsx              # Header dengan XP wave liquid bar
│
├── lib/
│   ├── posthog.ts                  # Helper tracker event kustom PostHog
│   ├── api.ts                      # Klien HTTP fetchApi terpadu
│   ├── theme-engine.ts             # Script pengendali FOUC dan hook useTheme
│   └── scroll-manager.ts          # Manajemen scroll halaman
│
├── styles/
│   └── globals.css                 # Design tokens, variabel CSS, animasi global
│
└── types/
    └── api.types.ts                # Shared TypeScript types dengan backend
```

---

### Konfigurasi Environment Variables

Buat file `apps/web/.env.local` untuk konfigurasi lokal:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

### Menjalankan Development Server

Dari direktori root monorepo:

```bash
npm run dev:web
```

Atau dari dalam direktori `apps/web/`:

```bash
npm run dev
```

Aplikasi berjalan di: `http://localhost:3000`

---

### Catatan Penting untuk Developer

- Jangan gunakan warna hardcoded di dalam file komponen. Semua warna harus merujuk ke variabel CSS yang didefinisikan di `globals.css`.
- Jangan tambahkan font baru ke dashboard tanpa persetujuan. Setiap font tambahan meningkatkan ukuran bundle dan memperlambat loading.
- Hindari useEffect yang tidak perlu untuk data fetching. Gunakan pola async yang sudah ada di `lib/api.ts` agar konsisten dengan format respons backend.
- Komponen baru wajib mobile-responsive menggunakan breakpoint yang sudah didefinisikan di `globals.css`.
