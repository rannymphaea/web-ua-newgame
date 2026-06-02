# NEWGAME Mobile Simulator 📱

Aplikasi Flutter Desktop mandiri (Standalone) untuk memfasilitasi peninjauan (preview) tampilan **Web App NEWGAME** di berbagai ukuran layar ponsel pintar Android dan iOS secara real-time — tanpa perlu membuka Chrome DevTools.

---

## ✨ Fitur Simulator Desktop

- 📱 **9 Preset Ponsel Terpopuler**: iPhone SE, iPhone 14, iPhone 14 Pro Max, Google Pixel 7, Samsung Galaxy S23, Redmi Note 12, OPPO Reno 10, iPad Mini, dan iPad Air.
- 🔄 **Peralihan Orientasi Instan**: Mendukung rotasi Portrait ↔ Landscape dengan sekali klik.
- 🔍 **Rentang Skala Dinamis**: Slider pembesaran ukuran (scale zoom) dari 30% hingga 100% untuk layar monitor resolusi rendah.
- 🎯 **Tautan Navigasi Cepat (Quick Nav)**: 8 tombol pintasan langsung untuk berpindah rute halaman platform NEWGAME secara instan.
- 🌐 **Alamat URL Kustom**: Input kolom URL yang bebas diubah untuk menguji server pengembangan lokal (`localhost`) maupun deployment staging.
- 🎨 **Branding Konsisten**: Tampilan antarmuka mode gelap premium yang konsisten dengan desain NEWGAME V2.

---

## 🏃 Setup & Cara Menjalankan

### Prasyarat Sistem (Prerequisites)
1. **Flutter SDK** versi ≥ 3.16.0 ([Panduan Instalasi Flutter](https://docs.flutter.dev/get-started/install)).
2. **Sistem Operasi Windows**: Microsoft Edge WebView2 Runtime (sudah terpasang secara default pada Windows 10/11).
3. **NEWGAME Development Server** sedang berjalan (Port 3000).

### Langkah-Langkah Menjalankan:

```bash
# 1. Pastikan Flutter SDK telah terinstall dengan benar
flutter --version

# 2. Masuk ke dalam direktori simulator
cd tools/mobile-simulator

# 3. Aktifkan dukungan Windows Desktop pada mesin Anda (cukup sekali saja)
flutter config --enable-windows-desktop

# 4. Buat file platform Windows (cukup sekali saja)
flutter create . --platforms windows

# 5. Pasang dependencies Flutter yang diperlukan
flutter pub get

# 6. Pastikan dev server Next.js Anda sudah aktif di terminal lain (Port 3000)
#    npm run dev:web

# 7. Jalankan aplikasi simulator desktop
flutter run -d windows
```

### Membuat Berkas Executable (`.exe` Release Build)
Jika Anda ingin mendistribusikan aplikasi simulator ini kepada pengurus/developer lain dalam format mandiri `.exe` yang terkompilasi penuh:
```bash
flutter build windows --release
# Hasil kompilasi akhir: tools/mobile-simulator/build/windows/x64/runner/Release/newgame_mobile_simulator.exe
```

---

## 📂 Struktur Berkas Proyek

```
tools/mobile-simulator/
├── lib/
│   └── main.dart          # Seluruh aplikasi simulator terpadu dalam 1 file
├── pubspec.yaml           # Konfigurasi dependensi Flutter
└── README.md              # Panduan dokumentasi ini
```

---

## 🔍 Panduan Pemecahan Masalah (Troubleshooting)

| Gejala Masalah | Penyebab Utama | Solusi Perbaikan |
|---|---|---|
| `WebView2 not installed` atau layar putih kosong | Driver Microsoft Edge WebView2 belum terpasang. | Unduh dan pasang secara manual di [Microsoft Edge WebView2 SDK](https://developer.microsoft.com/en-us/microsoft-edge/webview2/). |
| Halaman web tidak dapat dimuat (`Error Connection Refused`) | Server Next.js Anda belum aktif di port 3000. | Jalankan `npm run dev:web` pada root proyek monorepo terlebih dahulu. |
| Perintah `flutter` tidak dikenali di terminal | Flutter SDK belum ditambahkan ke Environment Path OS. | Tambahkan direktori `flutter/bin` ke sistem PATH Windows Anda, lalu restart terminal Anda. |
| Terjadi konflik Gradle atau build Windows gagal | File cache flutter lama bermasalah. | Jalankan perintah `flutter clean` lalu ulangi `flutter pub get` dan running. |
