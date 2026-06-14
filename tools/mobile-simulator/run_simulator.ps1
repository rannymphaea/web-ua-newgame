# run_simulator.ps1
# NEWGAME Mobile Simulator Launcher
# Usage: .\run_simulator.ps1
# Usage with custom device: .\run_simulator.ps1 -Device "Pixel_7_API35"

param(
    [string]$Device = "Pixel_7_API30",
    [switch]$NoDevServer
)

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$WebDir = Join-Path $Root "apps\web"
$SimDir = $PSScriptRoot

# Cari flutter binary
$FlutterLocal = Join-Path $Root "flutter\bin\flutter.bat"
if (Test-Path $FlutterLocal) {
    $Flutter = $FlutterLocal
} else {
    $Flutter = "flutter"
}

Write-Host ""
Write-Host "  NEWGAME Mobile Simulator" -ForegroundColor Yellow
Write-Host "  -----------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# 1. Jalankan dev server jika belum jalan
if (-not $NoDevServer) {
    $ServerRunning = $false
    try {
        Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop | Out-Null
        $ServerRunning = $true
    } catch {}

    if ($ServerRunning) {
        Write-Host "  [OK] Dev server sudah jalan di http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "  [>>] Menjalankan dev server..." -ForegroundColor Cyan
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$WebDir'; npm run dev" -WindowStyle Normal
        Write-Host "  [..] Menunggu server siap, 5 detik..." -ForegroundColor DarkGray
        Start-Sleep -Seconds 5
    }
}

# 2. Tampilkan emulator yang tersedia
Write-Host ""
Write-Host "  [>>] Emulator yang tersedia:" -ForegroundColor Cyan
& $Flutter emulators
Write-Host ""

# 3. Launch emulator
$EmuList = & $Flutter emulators 2>&1
if ($EmuList -match $Device) {
    Write-Host "  [>>] Menjalankan emulator: $Device" -ForegroundColor Cyan
    & $Flutter emulators --launch $Device
    Write-Host "  [..] Menunggu emulator boot, 30 detik..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 30
} else {
    Write-Host "  [!!] Emulator '$Device' tidak ditemukan." -ForegroundColor Red
    Write-Host "  Buat emulator di Android Studio -> Device Manager" -ForegroundColor Yellow
    Write-Host "  Atau install system image dulu via sdkmanager." -ForegroundColor DarkGray
    Write-Host ""

    Write-Host "  Device yang terdeteksi saat ini:" -ForegroundColor Cyan
    & $Flutter devices
    Write-Host ""

    $Confirm = Read-Host "  Lanjut dengan device yang tersedia? (y/n)"
    if ($Confirm -ne "y") { exit 0 }
}

# 4. Jalankan Flutter app
Write-Host ""
Write-Host "  [>>] Menjalankan NEWGAME Simulator..." -ForegroundColor Cyan
Write-Host "  Tekan Ctrl+C untuk berhenti" -ForegroundColor DarkGray
Write-Host "  -----------------------------------------" -ForegroundColor DarkGray
Write-Host ""

Set-Location $SimDir

# Auto-detect emulator yang sedang berjalan
$RunningDevices = & $Flutter devices 2>&1
$EmulatorId = $RunningDevices | Select-String "emulator-\d+" | ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1

if ($EmulatorId) {
    Write-Host "  [OK] Emulator terdeteksi: $EmulatorId" -ForegroundColor Green
    & $Flutter run -d $EmulatorId
} else {
    Write-Host "  [!!] Emulator tidak terdeteksi, pakai device selector otomatis..." -ForegroundColor Yellow
    & $Flutter run -d "emulator"
}
