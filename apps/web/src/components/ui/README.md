# Komponen UI Modular: ProfileCard & ToggleDarkMode

Direktori ini menampung komponen-komponen UI dasar yang modular, re-usable, dan kompatibel dengan Tailwind CSS dan sistem Token globals.css.

---

## 🎨 Detail Komponen Utama

### 1. `ProfileCard.tsx`
Komponen kartu informasi anggota terpadu (Avatar di sebelah kiri, Detail informasi di sebelah kanan) yang dirancang responsif dan fleksibel.

- **Props**:
  - `name: string` — Nama lengkap atau nama panggilan anggota.
  - `role?: string` — Peran/jabatan anggota (misal: "Superadmin", "Trainee").
  - `avatarUrl?: string` — URL foto profil Cloudinary/Firebase (jika kosong, otomatis memakai inisial atau fallback avatar Yua).
  - `leading?: ReactNode` — Node opsional di sisi kiri paling luar (misalnya ikon tombol notifikasi bel).
  - `className?: string` — Kustomisasi style tambahan via kelas CSS Tailwind.
- **Fitur Pendukung**:
  - **Integritas Tata Letak**: Menggunakan kelas CSS `min-w-0` dan `truncate` sehingga nama pengguna yang sangat panjang tidak memicu layout-overflow.
  - **Adaptasi Tema**: Secara reaktif merespons peralihan mode gelap/terang.

### 2. `ToggleDarkMode.tsx`
Tombol visual interaktif untuk mengalihkan tema situs (Gelap/Terang) secara langsung di peramban (browser).

- **Fitur Pendukung**:
  - **SSR Safe (Next.js)**: Untuk menghindari inkonsistensi rendering antara server dan client (Hydration Error), preferensi tema dibaca dari `localStorage` atau preferensi media-query sistem operasi di dalam `useEffect`.
  - **Zero FOUC**: Bekerja selaras dengan script `THEME_SCRIPT` pada root layout untuk menerapkan kelas `.dark` pada `<html>` sebelum elemen visual pertama digambar.

---

## 🏃 Contoh Penggunaan Komponen

```tsx
import ProfileCard from '@/components/ui/ProfileCard';
import ToggleDarkMode from '@/components/ui/ToggleDarkMode';
import { RiNotification3Line } from 'remixicon-react';

export default function TopBar() {
  return (
    <div className="flex items-center justify-between p-4 bg-background dark:bg-midnight">
      {/* Tombol Notifikasi & Profil User */}
      <ProfileCard 
        leading={
          <button aria-label="Notifikasi" className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full">
            <RiNotification3Line className="h-5 w-5 text-neutral-500" />
          </button>
        }
        name="ahmadadzanigibran22" 
        role="Superadmin" 
      />
      
      {/* Pengalih Tema */}
      <ToggleDarkMode />
    </div>
  );
}
```
