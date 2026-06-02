# NEWGAME V2 — Frontend Application

Platform frontend Next.js 14 UKM Game Development Universitas Andalas. Dokumentasi ini merinci modul-modul frontend, spec performa, observabilitas, serta petunjuk pengerjaan di direktori `apps/web/`.

---

## 🚀 Fitur Baru & Pembaruan V2

Dalam rilis V2, frontend telah ditingkatkan dengan standar kualitas tinggi:

1. **Space Grotesk Typography**: Mengimigrasi font brand "NEWGAME" ke Space Grotesk untuk nuansa tech yang modern, konsisten di semua platform, dan diintegrasikan langsung menggunakan `next/font/google` untuk optimasi CLS (Cumulative Layout Shift) nol.
2. **Interactive PirateMap**: Rekayasa ulang total visualisasi PirateMap menggunakan pure interactive SVG tree diagram, animasi stroke konektor staggered, dan reactive preview panel saat node di-hover.
3. **Web Mobile Simulator**: Halaman simulator mobile instan khusus internal pengembang pada route `/dev-tools` untuk mempreview visual Next.js langsung di iframe dengan 8 preset preset ponsel cerdas terpopuler.
4. **PostHog Observability**: Terintegrasi penuh dengan `PostHogProvider` untuk menangani perekaman pageview manual secara async dan pelacakan event CTA tanpa memperlambat First Contentful Paint (FCP).
5. **ErrorBoundary Resilience**: Komponen pembungkus React Error Boundary di tingkat layout utama untuk menangkap error crash runtime client-side secara aman, mengirim log incident ke PostHog, dan menyediakan tombol instant-retry tanpa crash halaman total.

---

## 🎨 Token Desain (Theme Engine & CSS Specs)

### Dark Mode Specs
- **Lokasi file**: `src/lib/theme-engine.ts`
- **Method**: Menggunakan script in-line anti-FOUC (Flash of Unstyled Content) yang disisipkan ke `<head>` sebelum rendering awal halaman untuk membaca `localStorage.theme` atau preferensi browser, dan menerapkan kelas `.dark` pada elemen `<html>`.
- **CSS Variables**: Semua nilai warna diatur melalui variabel CSS global pada `src/styles/globals.css`. **Dilarang menggunakan kode warna hex/rgb keras (hardcoded hex/rgb)** di dalam komponen. Gunakan `var(--clr-*)`.

### Motion Specs (Akselerasi GPU)
Animasi diatur menggunakan pure CSS keyframes pada file global dengan properti `will-change` untuk akselerasi perangkat keras GPU:

| Klas Animasi | Deskripsi Animasi | Durasi | Easing |
|---|---|---|---|
| `.animate-fade-in` | Transisi opacity masuk halus | 0.5s | `ease` |
| `.animate-slide-up` | Efek slide dari bawah ke atas | 0.4s | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `.animate-float` | Animasi mengambang melingkar untuk ilustrasi | 4.0s | `ease-in-out infinite` |
| `.skeleton` | Efek shimmer gradien berkilau untuk data loading | 1.5s | `ease-in-out infinite` |

---

## 📂 Peta Folder Frontend (Directory Map)

```
apps/web/src/
├── app/
│   ├── layout.tsx             # Entry layout utama, Space Grotesk & PostHog init
│   ├── dev-tools/             # [NEW] Web Mobile Simulator
│   ├── landing/               # Landing page publik (Interactive PirateMap)
│   └── (dashboard)/           # Portal dashboard terproteksi (Zustand store)
│
├── components/
│   ├── providers/
│   │   └── PostHogProvider.tsx # [NEW] Perekam otomatis navigasi pageview
│   ├── ui/
│   │   ├── ErrorBoundary.tsx  # [NEW] Penahan crash runtime client
│   │   ├── Toast.tsx          # Sistem notifikasi pop-up ARIA live
│   │   └── ToggleDarkMode.tsx # Tombol toggle mode gelap instan
│   └── layout/
│       ├── Sidebar.tsx        # Sidebar dinamis elastis hover & mobile responsive
│       └── TopBar.tsx         # Top header & visual XP wave liquid bar
│
├── lib/
│   ├── posthog.ts             # [NEW] Helper tracker event kustom PostHog
│   ├── api.ts                 # Klien HTTP fetchApi terpadu
│   └── theme-engine.ts        # Script pengendali FOUC & Hook useTheme
│
└── types/
    └── api.types.ts           # [NEW] Shared TypeScript types dengan backend
```

---

## 📏 Konfigurasi Variabel Lingkungan (Environment Variables)

Buat berkas `apps/web/.env.local` untuk konfigurasi lokal:

```env
# Alamat REST API Backend (NestJS)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# === POSTHOG ANALYTICS ===
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# === FALLBACK / LEGACY ACCESS ===
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

---

## 🏃 Cara Menjalankan Development Server

1. Pastikan Anda berada di direktori `apps/web/` atau jalankan workspace dari root:
   ```bash
   npm run dev --workspace=apps/web
   ```
2. Aplikasi akan berjalan di alamat default: [http://localhost:3000](http://localhost:3000).
