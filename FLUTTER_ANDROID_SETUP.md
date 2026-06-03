# 🤖 Flutter Android Setup — NEWGAME

> Dokumentasi setup Flutter + Android SDK dan cara menjalankan demo Android.

---

## 📊 Status Flutter Doctor

```
flutter doctor -v
```

| Komponen | Status | Catatan |
|---|---|---|
| ✅ Flutter 3.44.1 | **OK** | Channel stable, Dart 3.12.1 |
| ✅ Windows 11 25H2 | **OK** | — |
| ⚠️ Android toolchain | **Fixed** | Lihat seksi setup di bawah |
| ✅ Chrome | **OK** | v148 tersedia |
| ❌ Visual Studio | **Tidak diinstall** | Hanya diperlukan untuk build Windows desktop |
| ✅ Connected Device | **OK** | Windows, Chrome, Edge |
| ✅ Network Resources | **OK** | — |

---

## 🛠️ Perbaikan Android Toolchain

### Masalah yang Ditemukan

```
[!] Android toolchain - develop for Android devices (Android SDK version 36.1.0)
    X cmdline-tools component is missing.
    X Android license status unknown.
```

### Solusi yang Diterapkan

#### 1. Install Android cmdline-tools

```powershell
# Download cmdline-tools dari Google
$url = "https://dl.google.com/android/repository/commandlinetools-win-13114758_latest.zip"
Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\cmdline-tools.zip"

# Ekstrak ke SDK directory
Expand-Archive "$env:TEMP\cmdline-tools.zip" -DestinationPath "$env:TEMP\cmdl-tmp" -Force
$sdkRoot = "C:\Users\lenovo\AppData\Local\Android\sdk"
New-Item -ItemType Directory -Force -Path "$sdkRoot\cmdline-tools\latest"
Copy-Item "$env:TEMP\cmdl-tmp\cmdline-tools\*" "$sdkRoot\cmdline-tools\latest\" -Recurse -Force
```

#### 2. Lengkapi Android License Files

File disimpan di `C:\Users\lenovo\AppData\Local\Android\sdk\licenses\`

| File | Hash |
|---|---|
| `android-sdk-license` | `24333f8a63b6825ea9c5514f83c2829b004d1fee` |
| `android-sdk-license` | `8933bad161af4408b8ff1a559170f4f9b4e38f3d` |
| `android-sdk-preview-license` | `84831b9409646a918e30573bab4c9c91346d8abd` |
| `android-sdk-arm-dbt-license` | `859f317696f67ef3d7f30a50a5560e7834b43903` |
| `intel-android-extra-license` | `d975f751698a77b662f1254ddbeed3901e976f5a` |

#### 3. Install System Image & Buat AVD

```powershell
$sdkManager = "C:\Users\lenovo\AppData\Local\Android\sdk\cmdline-tools\latest\bin\sdkmanager.bat"
$avdManager = "C:\Users\lenovo\AppData\Local\Android\sdk\cmdline-tools\latest\bin\avdmanager.bat"

# Install platform + system image
& $sdkManager "platforms;android-35" "system-images;android-35;google_apis;x86_64"

# Buat AVD
echo "no" | & $avdManager create avd -n "Pixel_7_API35" -k "system-images;android-35;google_apis;x86_64" -d pixel_7

# Jalankan emulator
$emulator = "C:\Users\lenovo\AppData\Local\Android\sdk\emulator\emulator.exe"
Start-Process $emulator -ArgumentList "-avd", "Pixel_7_API35", "-no-snapshot-load"
```

---

## 📱 Android SDK Info

```
Android SDK: C:\Users\lenovo\AppData\Local\Android\sdk
Emulator version: 36.6.11.0
```

| Komponen | Versi |
|---|---|
| SDK Build-tools | 36.1.0, 37.0.0 |
| Platform | android-36.1 |
| Emulator | 36.6.11.0 |

---

## 🚀 NEWGAME Android Demo App

### Lokasi

```
tools/android-demo/
├── lib/
│   └── main.dart       ← App utama (NEWGAME themed)
├── android/            ← Android platform files
└── pubspec.yaml        ← Dependencies
```

### Fitur Demo App

| Halaman | Fitur |
|---|---|
| 🎬 Splash Screen | Animasi logo NEWGAME + loading bar |
| 📊 Dashboard | XP card, stats, active quests, badges |
| 📋 Quest Board | Daftar quest dengan progress bar |
| 🏆 Leaderboard | Podium + ranking players |
| 👤 Profile | Avatar, statistik, menu settings |

### Cara Menjalankan

```bash
# 1. Masuk ke direktori demo
cd tools/android-demo

# 2. Install dependencies
flutter pub get

# 3. Cek device yang tersedia
flutter devices

# 4. Jalankan di emulator Android
flutter run -d <emulator-id>

# Atau jalankan di Chrome (tanpa emulator)
flutter run -d chrome

# Atau jalankan di semua device
flutter run
```

---

## 🖥️ Mobile Simulator (Desktop)

Selain demo Android, ada juga **NEWGAME Mobile Simulator** — aplikasi Flutter Desktop yang mensimulasikan tampilan web app di berbagai ukuran device.

```bash
cd tools/mobile-simulator
flutter pub get
flutter run -d chrome   # Web mode (tanpa Visual Studio)
```

> **Note:** Untuk mode Windows Desktop, diperlukan Visual Studio dengan workload "Desktop development with C++".

---

## ❌ Visual Studio (Opsional)

Visual Studio **hanya diperlukan** jika ingin build Flutter untuk **Windows Desktop**.  
Untuk Android, Web, atau emulator → **tidak diperlukan**.

Download: https://visualstudio.microsoft.com/downloads/  
Workload yang dibutuhkan: **"Desktop development with C++"**

---

## 🔄 Verifikasi Akhir

```powershell
# Jalankan flutter doctor setelah setup
flutter doctor -v
```

**Target:** Semua item ✅ kecuali Visual Studio (opsional untuk Windows desktop).

---

## 📚 Referensi

- [Flutter Android Setup](https://flutter.dev/to/windows-android-setup)
- [Android cmdline-tools](https://developer.android.com/studio/command-line)
- [AVD Manager](https://developer.android.com/studio/command-line/avdmanager)
- [Flutter Doctor Docs](https://docs.flutter.dev/get-started/install/windows)

---

*Dibuat otomatis — NEWGAME Dev Team · 2026*
