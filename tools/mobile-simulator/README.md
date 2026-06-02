# NEWGAME Mobile Simulator

Aplikasi Flutter Desktop mandiri untuk mempreview tampilan Web App NEWGAME di berbagai ukuran layar ponsel Android dan iOS secara real-time — tanpa perlu membuka Chrome DevTools.

---

### Fitur Utama

| Fitur | Detail |
|---|---|
| 9 Preset Perangkat | iPhone SE, iPhone 14, iPhone 14 Pro Max, Google Pixel 7, Samsung Galaxy S23, Redmi Note 12, OPPO Reno 10, iPad Mini, iPad Air |
| Peralihan Orientasi | Rotasi Portrait dan Landscape dengan sekali klik |
| Slider Skala | Zoom dari 30% hingga 100% untuk monitor resolusi rendah |
| Quick Navigation | 8 tombol pintasan untuk berpindah rute halaman NEWGAME secara instan |
| URL Kustom | Input alamat bebas untuk menguji localhost maupun server staging |
| Tema Dark Mode | Antarmuka mode gelap yang konsisten dengan desain sistem NEWGAME V1.1 |

---

### Prasyarat Sistem

Sebelum menjalankan simulator, pastikan hal-hal berikut sudah terpenuhi:

1. Flutter SDK versi 3.16.0 atau lebih baru — [Panduan Instalasi Flutter](https://docs.flutter.dev/get-started/install)
2. Windows 10 atau 11 — Microsoft Edge WebView2 Runtime sudah terpasang secara default
3. NEWGAME Development Server berjalan di Port 3000 (`npm run dev:web`)

---

### Langkah Menjalankan Simulator

```bash
# 1. Verifikasi Flutter SDK sudah terinstall
flutter --version

# 2. Masuk ke direktori simulator
cd tools/mobile-simulator

# 3. Aktifkan dukungan Windows Desktop (cukup sekali)
flutter config --enable-windows-desktop

# 4. Buat file platform Windows (cukup sekali)
flutter create . --platforms windows

# 5. Install dependencies Flutter
flutter pub get

# 6. Pastikan dev server Next.js sudah berjalan di terminal lain
#    npm run dev:web

# 7. Jalankan simulator
flutter run -d windows
```

---

### Build Executable

Untuk mendistribusikan simulator kepada developer atau pengurus lain dalam format mandiri:

```bash
flutter build windows --release
```

File hasil build tersedia di:

```
tools/mobile-simulator/build/windows/x64/runner/Release/newgame_mobile_simulator.exe
```

Salin seluruh folder `Release/` — jangan hanya file `.exe`-nya saja, karena aplikasi membutuhkan file DLL dan aset di sekitarnya.

---

### Struktur Direktori

```
tools/mobile-simulator/
├── lib/
│   └── main.dart       # Seluruh kode aplikasi simulator dalam satu file
├── pubspec.yaml        # Konfigurasi dependensi Flutter
└── README.md           # Dokumen ini
```

---

### Pemecahan Masalah

| Gejala | Penyebab | Solusi |
|---|---|---|
| WebView2 not installed atau layar putih kosong | Driver Microsoft Edge WebView2 belum terpasang | Unduh dan pasang di [Microsoft Edge WebView2 SDK](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) |
| Halaman tidak dapat dimuat — Connection Refused | Server Next.js belum berjalan di Port 3000 | Jalankan `npm run dev:web` dari direktori root monorepo |
| Perintah flutter tidak dikenali | Flutter SDK belum ditambahkan ke PATH sistem | Tambahkan direktori `flutter/bin` ke PATH Windows, lalu restart terminal |
| Build Windows gagal atau konflik cache | File cache Flutter lama bermasalah | Jalankan `flutter clean`, kemudian ulangi `flutter pub get` dan `flutter run -d windows` |
