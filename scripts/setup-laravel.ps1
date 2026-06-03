# ═══════════════════════════════════════════════════════
#  NEWGAME — Laravel Setup Script
#  Jalankan: powershell -ExecutionPolicy Bypass -File setup-laravel.ps1
# ═══════════════════════════════════════════════════════

param(
  [string]$PHPVersion = "8.3",
  [string]$LaravelDir = "$PSScriptRoot\..\apps\laravel"
)

$ErrorActionPreference = "Stop"

function Header($msg) {
  Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
  Write-Host "  $msg" -ForegroundColor Yellow
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
}
function OK($msg)   { Write-Host "  ✅  $msg" -ForegroundColor Green }
function INFO($msg) { Write-Host "  ℹ️   $msg" -ForegroundColor Cyan }
function WARN($msg) { Write-Host "  ⚠️   $msg" -ForegroundColor Yellow }
function ERR($msg)  { Write-Host "  ❌  $msg" -ForegroundColor Red }

# ── PHP portable dir ────────────────────────────────────
$phpDir  = "$env:LOCALAPPDATA\php83"
$phpExe  = "$phpDir\php.exe"
$phpIni  = "$phpDir\php.ini"
$compExe = "$phpDir\composer.phar"

# ═══════════════════════════════════════════════════════
#  STEP 1: PHP
# ═══════════════════════════════════════════════════════
Header "STEP 1 — Cek / Install PHP 8.3 Portable"

if (Test-Path $phpExe) {
  $ver = (& $phpExe --version 2>&1 | Select-Object -First 1)
  OK "PHP sudah ada: $ver"
} else {
  INFO "Mendownload PHP 8.3 portable..."

  # Coba beberapa URL mirror
  $urls = @(
    "https://windows.php.net/downloads/releases/latest/php-8.3-nts-Win32-vs16-x64-latest.zip",
    "https://github.com/nicerapp/nicerapp/raw/main/php83.zip"
  )

  $downloaded = $false
  foreach ($url in $urls) {
    try {
      $tmpZip = "$env:TEMP\php83.zip"
      Invoke-WebRequest -Uri $url -OutFile $tmpZip -UseBasicParsing -TimeoutSec 120
      if ((Get-Item $tmpZip).Length -gt 1MB) {
        $downloaded = $true; break
      }
    } catch { WARN "Gagal dari: $url" }
  }

  if (-not $downloaded) {
    ERR "Download PHP gagal. Silakan download manual dari:"
    Write-Host "     https://windows.php.net/download/" -ForegroundColor White
    Write-Host "     Ekstrak ke: $phpDir" -ForegroundColor White
    Write-Host ""
    Write-Host "  Setelah itu jalankan script ini lagi." -ForegroundColor Cyan
    exit 1
  }

  INFO "Mengekstrak PHP..."
  Remove-Item $phpDir -Recurse -Force -ErrorAction SilentlyContinue
  Expand-Archive "$env:TEMP\php83.zip" -DestinationPath $phpDir -Force
  Remove-Item "$env:TEMP\php83.zip" -Force

  if (-not (Test-Path $phpExe)) {
    ERR "Ekstrak gagal — php.exe tidak ditemukan di $phpDir"
    exit 1
  }
  OK "PHP diekstrak ke $phpDir"
}

# ── Konfigurasi php.ini ──────────────────────────────────
if (-not (Test-Path $phpIni)) {
  $iniSample = "$phpDir\php.ini-production"
  if (Test-Path $iniSample) {
    Copy-Item $iniSample $phpIni
  } else {
    New-Item $phpIni -ItemType File -Force | Out-Null
  }
}

$iniContent = Get-Content $phpIni -Raw -ErrorAction SilentlyContinue
$extDir = "$phpDir\ext"
$extensionsToEnable = @("curl","fileinfo","mbstring","openssl","pdo_sqlite","pdo_mysql","tokenizer","xml","ctype","bcmath","json")

foreach ($ext in $extensionsToEnable) {
  $dllPath = "$extDir\php_$ext.dll"
  if (Test-Path $dllPath) {
    if ($iniContent -match ";extension=$ext") {
      $iniContent = $iniContent -replace ";extension=$ext", "extension=$ext"
    } elseif ($iniContent -notmatch "^extension=$ext") {
      $iniContent += "`nextension=$ext"
    }
  }
}

# Fix extension_dir
if ($iniContent -match ";extension_dir = ""ext""") {
  $iniContent = $iniContent -replace ';extension_dir = "ext"', "extension_dir = `"$extDir`""
}

Set-Content $phpIni $iniContent -Encoding UTF8
OK "php.ini dikonfigurasi (ext: $($extensionsToEnable -join ', '))"

# ═══════════════════════════════════════════════════════
#  STEP 2: Composer
# ═══════════════════════════════════════════════════════
Header "STEP 2 — Cek / Install Composer"

if (Test-Path $compExe) {
  $compVer = (& $phpExe $compExe --version 2>&1 | Select-Object -First 1)
  OK "Composer sudah ada: $compVer"
} else {
  INFO "Mendownload Composer..."
  try {
    Invoke-WebRequest -Uri "https://getcomposer.org/composer.phar" -OutFile $compExe -UseBasicParsing
    OK "Composer.phar didownload"
  } catch {
    ERR "Download Composer gagal: $_"
    exit 1
  }
}

# Buat wrapper bat
$compBat = "$phpDir\composer.bat"
@"
@echo off
"$phpExe" "$compExe" %*
"@ | Set-Content $compBat -Encoding ASCII

# ═══════════════════════════════════════════════════════
#  STEP 3: Tambah ke PATH (session ini)
# ═══════════════════════════════════════════════════════
Header "STEP 3 — Set PATH"

$env:PATH = "$phpDir;" + $env:PATH
$env:COMPOSER_HOME = "$env:APPDATA\Composer"
OK "PHP & Composer ditambahkan ke PATH (session ini)"
INFO "Untuk permanent, tambahkan $phpDir ke System Environment Variables"

# ═══════════════════════════════════════════════════════
#  STEP 4: Buat Laravel Project
# ═══════════════════════════════════════════════════════
Header "STEP 4 — Buat Laravel Project"

$targetDir = (Resolve-Path "$PSScriptRoot").Path.TrimEnd('\') + "\..\apps\laravel"
$targetDir = [System.IO.Path]::GetFullPath($targetDir)

if (Test-Path "$targetDir\artisan") {
  OK "Laravel sudah ada di: $targetDir"
} else {
  INFO "Membuat Laravel project di: $targetDir"
  New-Item $targetDir -ItemType Directory -Force | Out-Null

  # Composer create-project
  & $phpExe $compExe create-project laravel/laravel . --prefer-dist --no-interaction
  if ($LASTEXITCODE -ne 0) {
    ERR "Laravel create-project gagal"
    exit 1
  }
  OK "Laravel project dibuat!"
}

# ═══════════════════════════════════════════════════════
#  STEP 5: Konfigurasi .env
# ═══════════════════════════════════════════════════════
Header "STEP 5 — Konfigurasi .env"

$envFile = "$targetDir\.env"
$envExample = "$targetDir\.env.example"

if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
  Copy-Item $envExample $envFile
}

if (Test-Path $envFile) {
  $env_content = Get-Content $envFile -Raw
  $env_content = $env_content -replace 'APP_NAME=Laravel', 'APP_NAME=NEWGAME'
  $env_content = $env_content -replace 'APP_URL=http://localhost', 'APP_URL=http://localhost:8000'
  $env_content = $env_content -replace 'DB_CONNECTION=mysql', 'DB_CONNECTION=sqlite'
  # Comment out MySQL settings
  $env_content = $env_content -replace '^DB_HOST=',     '#DB_HOST='
  $env_content = $env_content -replace '^DB_PORT=',     '#DB_PORT='
  $env_content = $env_content -replace '^DB_DATABASE=', '#DB_DATABASE='
  $env_content = $env_content -replace '^DB_USERNAME=', '#DB_USERNAME='
  $env_content = $env_content -replace '^DB_PASSWORD=', '#DB_PASSWORD='
  Set-Content $envFile $env_content -Encoding UTF8
  OK ".env dikonfigurasi (SQLite, NEWGAME)"
}

# Generate key
Push-Location $targetDir
& $phpExe artisan key:generate --ansi 2>&1 | Write-Host
& $phpExe artisan migrate --force 2>&1 | Write-Host
Pop-Location

# ═══════════════════════════════════════════════════════
#  SUMMARY
# ═══════════════════════════════════════════════════════
Header "✅ SETUP SELESAI!"
Write-Host ""
Write-Host "  Laravel ada di  : $targetDir" -ForegroundColor White
Write-Host "  PHP             : $phpExe" -ForegroundColor White
Write-Host "  Composer        : $compBat" -ForegroundColor White
Write-Host ""
Write-Host "  ┌─ Cara menjalankan Laravel ──────────────────" -ForegroundColor DarkGray
Write-Host "  │  cd apps\laravel" -ForegroundColor Yellow
Write-Host "  │  ..\..\scripts\php.bat artisan serve" -ForegroundColor Yellow
Write-Host "  │  → http://localhost:8000" -ForegroundColor Green
Write-Host "  └────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
