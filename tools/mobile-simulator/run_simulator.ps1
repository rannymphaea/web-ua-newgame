# run_simulator.ps1
# Jalankan NEWGAME Mobile Simulator dengan satu klik
# Usage: .\run_simulator.ps1
# Usage dengan device custom: .\run_simulator.ps1 -Device "Pixel_7_API35"

param(
    [string]$Device = "Pixel_7_API35",
    [switch]$NoDevServer  # skip dev server jika sudah jalan
)

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$WebDir = Join-Path $Root "apps\web"
$SimDir = $PSScriptRoot
$FlutterBin = Join-Path $Root "flutter\bin\flutter.bat"

# Gunakan flutter dari PATH jika tidak ada di project root
if (-not (Test-Path $FlutterBin)) {
    $FlutterBin = "flutter"
}

Write-Host ""
Write-Host "  NEWGAME Mobile Simulator" -ForegroundColor Yellow
Write-Host "  ─────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# 1. Jalankan dev server di background (jika belum jalan)
if (-not $NoDevServer) {
    $ServerRunning = $false
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
        $ServerRunning = $true
    } catch {}

    if ($ServerRunning) {
        Write-Host "  [OK] Dev server sudah berjalan di http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "  [>>] Menjalankan dev server (http://localhost:3000)..." -ForegroundColor Cyan
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$WebDir'; npm run dev" -WindowStyle Normal
        Write-Host "  [..] Tunggu server siap (5 detik)..." -ForegroundColor DarkGray
        Start-Sleep -Seconds 5
    }
}

# 2. Cek emulator tersedia
Write-Host ""
Write-Host "  [>>] Memeriksa emulator..." -ForegroundColor Cyan
$Emulators = & $FlutterBin emulators 2>&1
Write-Host $Emulators

# 3. Launch emulator jika ada
if ($Emulators -match $Device) {
    Write-Host ""
    Write-Host "  [>>] Menjalankan emulator '$Device'..." -ForegroundColor Cyan
    & $FlutterBin emulators --launch $Device
    Write-Host "  [..] Tunggu emulator boot (~30 detik)..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 30
} else {
    Write-Host ""
    Write-Host "  [!!] Emulator '$Device' tidak ditemukan." -ForegroundColor Red
    Write-Host "  Buat emulator dulu di Android Studio > Device Manager" -ForegroundColor Yellow
    Write-Host "  Atau jalankan manual: flutter emulators --launch [nama]" -ForegroundColor DarkGray
    Write-Host ""

    # Coba cari device lain yang tersedia
    $Devices = & $FlutterBin devices 2>&1
    Write-Host $Devices
    Write-Host ""

    $confirm = Read-Host "  Lanjut dengan device yang tersedia? (y/n)"
    if ($confirm -ne "y") { exit 0 }
}

# 4. Jalankan Flutter app
Write-Host ""
Write-Host "  [>>] Menjalankan NEWGAME Mobile Simulator..." -ForegroundColor Cyan
Write-Host "  Ctrl+C untuk berhenti" -ForegroundColor DarkGray
Write-Host "  ─────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

Set-Location $SimDir
& $FlutterBin run
