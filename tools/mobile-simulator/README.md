# NEWGAME Mobile Simulator 📱

Flutter Desktop App untuk preview **NEWGAME web app** di berbagai ukuran device Android & iOS secara real-time — tanpa perlu buka Chrome DevTools.

---

## ✨ Fitur

| Fitur | Detail |
|---|---|
| 📱 **9 Device Presets** | iPhone SE, iPhone 14, iPhone 14 Pro Max, Pixel 7, Galaxy S23, Redmi Note 12, OPPO Reno 10, iPad Mini, iPad Air |
| 🔄 **Orientasi** | Portrait ↔ Landscape toggle instant |
| 🔍 **Zoom Scale** | 30% – 100% slider |
| 🔗 **Quick Nav** | 8 link cepat ke semua halaman NEWGAME |
| 🌐 **Custom URL** | Input URL bebas (localhost maupun staging) |
| ⚡ **Loading bar** | Progress indicator real-time |
| 🎨 **Dark Theme** | Konsisten dengan branding NEWGAME |

---

## 🚀 Setup & Menjalankan

### Prerequisites
- **Flutter SDK** ≥ 3.16.0 ([install](https://docs.flutter.dev/get-started/install))
- **Windows**: Microsoft Edge WebView2 Runtime (sudah terinstall di Windows 10/11)
- **NEWGAME dev server** berjalan di port 3000

### Langkah-langkah

```bash
# 1. Pastikan Flutter sudah terinstall
flutter --version

# 2. Masuk ke direktori simulator
cd tools/mobile-simulator

# 3. Enable Windows desktop support (sekali saja)
flutter config --enable-windows-desktop

# 4. Buat platform files Windows (sekali saja, jika belum ada)
flutter create . --platforms windows

# 5. Install dependencies
flutter pub get

# 6. Jalankan NEWGAME dev server terlebih dahulu
#    (di terminal lain, dari root project)
#    npm run dev

# 7. Run simulator
flutter run -d windows
```

### Build executable (opsional)
```bash
flutter build windows --release
# Output: build/windows/x64/runner/Release/newgame_mobile_simulator.exe
```

---

## 📂 Struktur Proyek

```
tools/mobile-simulator/
├── lib/
│   └── main.dart          # Full app — semua komponen dalam 1 file
├── pubspec.yaml           # Dependencies
└── README.md              # Dokumentasi ini
```

---

## 🔧 Kustomisasi

### Tambah device baru
Edit `kDevices` list di `lib/main.dart`:
```dart
DevicePreset(name: 'Nama Device', emoji: '📱', width: 412, height: 915),
```

### Ubah default URL
Edit konstanta `kBaseUrl`:
```dart
const String kBaseUrl = 'http://localhost:3000';
```

### Tambah quick nav link
Edit `kNavLinks`:
```dart
('Label', '/path', '🎯'),
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| "WebView2 not installed" | Install [Edge WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) |
| Halaman tidak load | Pastikan `npm run dev` sudah berjalan di port 3000 |
| Flutter not found | Install Flutter dan tambahkan ke PATH |
| Build gagal | Jalankan `flutter doctor` dan ikuti instruksinya |

---

## 📝 Catatan

- Simulator ini **hanya untuk dev** — tidak di-deploy ke production
- WebView menggunakan **WebView2** (Edge engine) di Windows
- Untuk testing yang lebih akurat, gunakan browser Chrome DevTools atau device fisik
