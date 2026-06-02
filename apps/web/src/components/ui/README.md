# Komponen UI — NEWGAME V2

Direktori ini menampung komponen antarmuka yang modular, dapat digunakan ulang (reusable), dan kompatibel dengan sistem design token yang didefinisikan di `src/styles/globals.css`.

---

## Daftar Komponen

| Komponen | File | Deskripsi Singkat |
|---|---|---|
| `ProfileCard` | `ProfileCard.tsx` | Kartu informasi anggota dengan avatar, nama, dan role |
| `ToggleDarkMode` | `ToggleDarkMode.tsx` | Tombol peralihan tema gelap/terang |
| `ErrorBoundary` | `ErrorBoundary.tsx` | Penahan crash runtime sisi client dengan tombol retry |
| `Toast` | `Toast.tsx` | Notifikasi pop-up dengan dukungan ARIA live region |

---

## ProfileCard

Komponen kartu informasi anggota terpadu — avatar di sisi kiri, detail nama dan role di sisi kanan — yang dirancang responsif dan fleksibel.

### Props

| Prop | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `name` | `string` | Ya | Nama lengkap atau nama panggilan anggota |
| `role` | `string` | Tidak | Peran atau jabatan (contoh: `Superadmin`, `Trainee`) |
| `avatarUrl` | `string` | Tidak | URL foto profil dari Cloudinary atau Firebase. Jika kosong, menampilkan inisial atau avatar Yua |
| `leading` | `ReactNode` | Tidak | Node opsional di sisi kiri luar (contoh: tombol notifikasi) |
| `className` | `string` | Tidak | Kelas CSS tambahan untuk kustomisasi tampilan |

### Catatan Implementasi

- Menggunakan kelas `min-w-0` dan `truncate` agar nama pengguna yang panjang tidak menyebabkan layout overflow.
- Secara reaktif merespons peralihan mode gelap/terang melalui variabel CSS global.

---

## ToggleDarkMode

Tombol interaktif untuk mengalihkan tema situs antara mode gelap dan terang secara instan di browser.

### Catatan Implementasi

- **SSR Safe (Next.js)** — Preferensi tema dibaca dari `localStorage` atau media-query sistem operasi di dalam `useEffect` untuk menghindari Hydration Error antara server dan client.
- **Zero FOUC** — Bekerja selaras dengan script `THEME_SCRIPT` pada root `layout.tsx` yang menerapkan kelas `.dark` pada elemen `<html>` sebelum elemen visual pertama digambar.

---

## Contoh Penggunaan

```tsx
import ProfileCard from '@/components/ui/ProfileCard';
import ToggleDarkMode from '@/components/ui/ToggleDarkMode';
import { RiNotification3Line } from 'remixicon-react';

export default function TopBar() {
  return (
    <div className="flex items-center justify-between p-4 bg-background dark:bg-midnight">

      <ProfileCard
        leading={
          <button aria-label="Notifikasi" className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full">
            <RiNotification3Line className="h-5 w-5 text-neutral-500" />
          </button>
        }
        name="Ahmad Adzani Gibran"
        role="Superadmin"
        avatarUrl="https://res.cloudinary.com/newgame/image/upload/v1/users/ahmad.jpg"
      />

      <ToggleDarkMode />

    </div>
  );
}
```

---

## Aturan Penambahan Komponen Baru

Sebelum membuat komponen UI baru, pertimbangkan hal-hal berikut:

1. **Cek komponen yang sudah ada** — Pastikan belum ada komponen dengan fungsi serupa di direktori ini.
2. **Gunakan variabel CSS** — Jangan gunakan warna hardcoded. Gunakan selalu `var(--clr-*)` yang didefinisikan di `globals.css`.
3. **Responsif sejak awal** — Setiap komponen baru harus diuji di tampilan mobile (lebar layar di bawah 768px).
4. **Sertakan props `className`** — Tambahkan prop `className?: string` agar komponen mudah dikustomisasi dari luar tanpa harus mengubah file komponen itu sendiri.
5. **Dokumentasikan di sini** — Tambahkan entri baru ke tabel Daftar Komponen di bagian atas dokumen ini setiap kali komponen baru ditambahkan.
