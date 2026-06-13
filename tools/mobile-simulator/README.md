# NEWGAME Mobile — Flutter App

Aplikasi mobile untuk platform NEWGAME. Menampilkan web app (`localhost:3000`) dalam WebView native Android dengan desain dark theme yang sama.

## Fitur

| Fitur | Keterangan |
|---|---|
| WebView Android | Menampilkan web app NEWGAME dalam WebView native |
| Bottom Nav | 5 halaman utama: Landing, Dashboard, Scan, Berita, Profil |
| Drawer | Menu lengkap semua 11 halaman |
| Error Handling | Tampilan error jika server tidak berjalan + tombol retry |
| Server Config | Dialog untuk ganti URL server (emulator vs HP fisik) |
| Dark Theme | Palet warna sama dengan web (kBg, kGold, kPurple, dsb) |
| Loading Bar | Progress indicator saat halaman loading |

## Cara Pakai

### Prasyarat

1. Flutter SDK 3.16+ terinstall
2. Android SDK / emulator
3. Dev server berjalan: `cd apps/web && npm run dev`

### Jalankan di Emulator Android

```bash
cd tools/mobile-simulator

# Install dependencies
flutter pub get

# Jalankan
flutter run
```

Emulator menggunakan `10.0.2.2:3000` untuk mengakses `localhost` PC.

### Jalankan di HP Fisik (via USB)

1. Aktifkan **Developer Mode** dan **USB Debugging** di HP
2. Hubungkan HP ke PC via USB
3. Cari IP PC: `ipconfig` → cari IPv4 di WiFi yang sama
4. Jalankan:

```bash
flutter run
```

5. Di app, tekan ikon gear (⚙️) → ganti URL ke `http://[IP_PC]:3000`

### Preview di Chrome (Web Simulator)

Versi web simulator lama masih bisa dijalankan terpisah jika dibutuhkan.

## Struktur

```
tools/mobile-simulator/
├── lib/
│   └── main.dart          # App utama (WebView + navigation)
├── android/               # Platform Android
│   └── app/src/main/
│       └── AndroidManifest.xml  # Internet + cleartext permission
├── pubspec.yaml           # Dependencies (webview_flutter, connectivity_plus)
└── README.md              # Dokumen ini
```

## Konfigurasi URL

| Skenario | URL |
|---|---|
| Emulator Android | `http://10.0.2.2:3000` (default) |
| HP fisik di WiFi yang sama | `http://[IP_PC]:3000` |
| Production | `https://unandnewgame-tan.vercel.app` |

URL bisa diubah via dialog Settings (ikon gear) di app bar.

## Catatan

- `android:usesCleartextTraffic="true"` diperlukan untuk akses HTTP localhost
- WebView memblokir navigasi ke URL eksternal (hanya localhost/LAN)
- Dark mode otomatis di-inject via `localStorage.setItem('ng-theme', 'dark')`
