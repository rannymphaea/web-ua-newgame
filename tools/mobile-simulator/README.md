# NEWGAME Mobile Simulator

Simulator untuk melihat tampilan web NEWGAME di dalam bingkai HP Android langsung dari komputer.

---

## Cara menjalankan (Windows, tanpa install Visual Studio)

### Prasyarat

1. Flutter SDK sudah ada (bundled di `../../flutter/`)
2. Android Studio sudah terinstall
3. Dev server berjalan: `cd apps/web && npm run dev`

### Langkah 1 — Buat Android Emulator (sekali saja)

Buka **Android Studio → Device Manager → Create Device**:

- Hardware: Pixel 7
- System Image: API 35, Google APIs, x86_64
- AVD Name: `Pixel_7_API35`
- RAM: 2048 MB, Storage: 8 GB
- Graphics: Hardware - GLES 2.0

Atau via terminal (jika sdkmanager sudah di PATH):

```
sdkmanager "system-images;android-35;google_apis;x86_64"
avdmanager create avd -n Pixel_7_API35 -k "system-images;android-35;google_apis;x86_64" -d pixel_7
```

### Langkah 2 — Jalankan simulator

```bash
cd tools/mobile-simulator

# Lihat emulator yang tersedia
flutter emulators

# Jalankan emulator
flutter emulators --launch Pixel_7_API35

# Tunggu emulator muncul di layar (~30 detik)
# Lalu jalankan app
flutter run -d emulator-5554
```

Dev server harus berjalan di `http://localhost:3000`.
Emulator otomatis menggunakan `10.0.2.2` sebagai alamat localhost PC.

### Langkah 3 — Navigasi

Setelah app muncul di emulator:

- **Bottom nav**: Landing, Dashboard, Scan QR, Berita, Profil
- **Hamburger (≡)**: semua halaman tersedia
- **Settings (⚙)**: ganti IP jika pakai HP fisik via WiFi

---

## Struktur file

```
lib/
  main.dart              - Entry point, routing per platform
  simulator_android.dart - Full-screen WebView untuk Android/Emulator
  simulator_windows.dart - Phone-frame window untuk Windows desktop*
```

*Windows desktop butuh Visual Studio Build Tools untuk di-build.
Gunakan Android emulator sebagai alternatif yang lebih mudah.

---

## Troubleshooting

**App tidak bisa connect ke web:**
- Pastikan `npm run dev` sudah jalan di `apps/web`
- Emulator gunakan `10.0.2.2:3000` (bukan localhost)
- HP fisik via WiFi: buka Settings di app → ganti ke IP PC kamu

**Emulator sangat lambat:**
- Aktifkan HAXM / Hyper-V di BIOS
- Atau gunakan x86_64 image (bukan ARM)
- Turunkan RAM emulator ke 1024 MB jika PC low-end

**`flutter run` tidak menemukan device:**
```bash
flutter devices   # lihat device yang terdeteksi
flutter emulators # lihat emulator yang tersedia
```

---

## Mode Windows desktop (opsional)

Butuh **Visual Studio 2022** dengan workload "Desktop development with C++".

```bash
flutter build windows --debug
flutter run -d windows
```

Menampilkan jendela berukuran HP dengan phone frame grafis dan sidebar navigasi.
Menggunakan EdgeChromium WebView (butuh Microsoft Edge WebView2 Runtime).

---

versi: 0.1.5 | NEWGAME UKM Game Development, Universitas Andalas
