# MANUAL_TASKS.md — Tugas Wajib Manual
## NEWGAME UKM Game Development, Universitas Andalas

> Dokumen ini berisi **semua tugas yang tidak bisa dikerjakan otomatis oleh AI atau CI/CD**.
> Setiap item membutuhkan akses manusia langsung: credential, cloud console, distribusi fisik, atau keputusan arsitektur.
>
> **Siapa yang bertanggung jawab:** Code Commander / Pixel Presiden / DevOps.

---

## STATUS LEGENDA

```
[!] URGENT    — Wajib sebelum platform bisa berjalan di production
[~] PENTING   — Diperlukan untuk fitur tertentu berfungsi
[-] OPSIONAL  — Bisa dilakukan kapan saja, tidak memblokir core
```

---

## 🔴 URGENT — Wajib Sebelum Go-Live

### [!] 1. SEED FIRESTORE MEMBER DATA

Tanpa ini, tidak ada satupun anggota yang bisa registrasi.

```bash
# Pastikan service account sudah dikonfigurasi di environment
FIREBASE_PROJECT_ID=xxx \
FIREBASE_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com \
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" \
  node apps/api/src/scripts/seed-members.js
```

**Hasil yang diharapkan:** 125 dokumen di koleksi `members` Firestore.
**Cek:** Buka Firebase Console → Firestore → `members` → pastikan ada 125 dokumen.

---

### [!] 2. ISI DAN DISTRIBUSIKAN MEMBER CREDENTIALS

Setiap anggota butuh **Member ID** dan **Kode Akses (tempPassword)** untuk bisa registrasi.

1. Buka file `MEMBER_CREDENTIALS.md`
2. Isi kolom `tempPassword` untuk setiap anggota (atau gunakan yang sudah di-generate oleh seed script)
3. Distribusikan ke anggota via:
   - WhatsApp Group angkatan
   - Discord server NEWGAME
   - Kertas fisik saat rapat (jika akses digital terbatas)

**Format yang diberikan ke anggota:**
```
Member ID  : NG11020001PG
Kode Akses : TempPass123!
URL Daftar : https://unandnewgame-tan.vercel.app/login
```

---

### [!] 3. JALANKAN PRISMA MIGRATION DI PRODUCTION

Diperlukan sebelum fitur auth berbasis PostgreSQL bisa berjalan.

```bash
# Di mesin yang memiliki akses DATABASE_URL production
cd apps/api
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require" \
  npx prisma migrate deploy
```

**Platform yang direkomendasikan:** Neon (https://neon.tech) atau Supabase.
**Cek:** Jalankan `npx prisma db pull` — tidak boleh ada error.

---

### [!] 4. KONFIGURASI ENVIRONMENT VARIABLES DI VERCEL

Buka: https://vercel.com/rannymphaea → Project → Settings → Environment Variables

#### Frontend (apps/web)
| Variable | Nilai |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.unandnewgame.vercel.app/api` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | dari Firebase Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `newgame-xxx.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `newgame-xxx` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `newgame-xxx.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | dari Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | dari Firebase Console |
| `NEXT_PUBLIC_POSTHOG_KEY` | dari PostHog dashboard |
| `NEXT_PUBLIC_SITE_URL` | `https://unandnewgame-tan.vercel.app` |

#### Backend (apps/api)
| Variable | Nilai |
|---|---|
| `FIREBASE_PROJECT_ID` | ID project Firebase |
| `FIREBASE_CLIENT_EMAIL` | email service account |
| `FIREBASE_PRIVATE_KEY` | private key (sertakan newlines) |
| `DATABASE_URL` | PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | nama cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |
| `UPSTASH_REDIS_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis token |
| `OPENAI_API_KEY` | untuk fitur AI/embedding |
| `ZILLIZ_URI` | Zilliz Cloud URI |
| `ZILLIZ_TOKEN` | Zilliz Cloud token |
| `SMTP_HOST` | SMTP server (e.g. smtp.gmail.com) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | email pengirim |
| `SMTP_PASS` | password / app password |
| `SMTP_FROM` | `NEWGAME <email@domain.com>` |

---

## 🟡 PENTING — Untuk Fitur Tertentu

### [~] 5. GOOGLE OAUTH REDIRECT URI

Tanpa ini, tombol "Sign in with Google" tidak akan berfungsi.

1. Buka https://console.cloud.google.com
2. APIs & Services → Credentials → OAuth 2.0 Client IDs
3. Edit client yang digunakan
4. Tambahkan **Authorized Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://unandnewgame-tan.vercel.app/api/auth/callback/google
   ```
5. Save dan tunggu beberapa menit untuk propagasi

---

### [~] 6. CLOUDINARY ACCOUNT SETUP

Tanpa ini: upload foto profil, media gallery, cover artikel tidak berfungsi.

1. Buat akun di https://cloudinary.com (free tier cukup untuk awal)
2. Dashboard → Settings → Access Keys
3. Copy: Cloud Name, API Key, API Secret
4. Isi di Vercel env (lihat item 4) dan `apps/api/.env.local`

**Folder yang dibuat otomatis:**
- `media/avatar/{userId}` — foto profil
- `media/videos/{userId}` — video upload
- `media/content` — gambar konten

---

### [~] 7. SETUP SMTP EMAIL

Tanpa ini: email notification, event reminder, dan password reset email tidak terkirim.

**Opsi 1 — Gmail App Password (development/kecil):**
1. Aktifkan 2FA di Gmail
2. Google Account → Security → App Passwords → Buat untuk "Mail"
3. Gunakan sebagai `SMTP_PASS`
4. `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`

**Opsi 2 — Mailgun/SendGrid (production):**
1. Daftar di https://mailgun.com atau https://sendgrid.com
2. Verifikasi domain
3. Gunakan SMTP credentials dari dashboard

---

### [~] 8. GITHUB SECRET UNTUK AUTO-BACKUP

1. Buka: github.com/rannymphaea/web-ua-newgame
2. Settings → Secrets and variables → Actions
3. New repository secret:
   - Name: `DATABASE_URL`
   - Value: connection string PostgreSQL production

**Efek:** Backup otomatis berjalan setiap hari jam 02:00 WIB via `.github/workflows/backup.yml`

---

## 🟢 OPSIONAL — Tidak Memblokir Core

### [-] 9. FIRESTORE ROLE MIGRATION

Hanya perlu jika ada user lama dengan role schema sebelumnya.

```bash
# Dry run dulu — lihat apa yang akan diubah
node scripts/migrate-firestore.mjs --collection users --dry-run

# Jika hasilnya benar, jalankan migrasi
node scripts/migrate-firestore.mjs --collection users
```

Mapping:
- `superadmin` → `code commander`
- `presiden` → `pixel presiden`
- `pengurus` → `member`

---

### [-] 10. FLUTTER SUBMODULE (TRACKING PROPER)

Flutter app saat ini adalah embedded repo biasa, bukan git submodule resmi.

```bash
# Hapus tracking lama
git rm --cached tools/mobile-simulator

# Tambah sebagai submodule resmi
git submodule add https://github.com/rannymphaea/newgame-flutter.git tools/mobile-simulator
git commit -m "chore: convert flutter to proper git submodule"
```

---

### [-] 11. SETUP ZILLIZ / MILVUS (FITUR AI)

Diperlukan untuk semantic news search dan member recommendation.

1. Buat cluster di https://zilliz.com
2. Buat collection `news_embeddings`:
   - Field: `id` (varchar), `title` (varchar), `content` (varchar), `embedding` (float_vector, dim=1536)
3. Copy URI dan Token ke Vercel env (`ZILLIZ_URI`, `ZILLIZ_TOKEN`)
4. Test koneksi via `/ai/test-connection` endpoint

---

### [-] 12. ANOMALY ALERTING

Diperlukan untuk mendapat notifikasi saat ada aktivitas mencurigakan.

**Opsi:** PagerDuty, OpsGenie, atau email sederhana via webhook.

1. Buat webhook di PagerDuty/OpsGenie
2. Tambahkan `ALERT_WEBHOOK_URL` ke environment
3. Update `anomaly.service.ts` untuk memanggil webhook saat score > 0.85

---

### [-] 13. POST-QUANTUM CRYPTOGRAPHY (FUTURE)

Interface placeholder sudah ada di codebase. Implementasi perlu:
1. Library: `liboqs-node` atau implementasi manual lattice-based crypto
2. Keputusan arsitektur: encrypt apa? (session tokens? user vault?)
3. Migration plan untuk data yang sudah ada

**Estimasi:** 2-3 sprint, tidak urgent untuk v0.x

---

## CHECKLIST PRE-LAUNCH

```
[ ] Seed Firestore (125 member)
[ ] Distribusi credentials ke semua anggota
[ ] Prisma migrate deploy di production DB
[ ] Semua env variables terisi di Vercel
[ ] Google OAuth redirect URI terdaftar
[ ] Cloudinary credentials valid (test upload foto)
[ ] SMTP email terkonfigurasi (test kirim email)
[ ] GitHub secret DATABASE_URL ada (untuk backup otomatis)
[ ] Test login semua metode (email, MemberID, Google)
[ ] Test QR scan dari HP (buka /scan)
[ ] Test admin panel (create event, import member, lihat SIEM)
[ ] Monitor Vercel logs 30 menit pertama setelah deploy
```

---

## CHECKLIST INFRA LANJUTAN (Tidak Urgent, Tapi Perlu)

```
[ ] Docker: uji docker compose up --build di WSL2 / Linux
[ ] Flutter: build APK debug, install di HP anggota, tes fitur dasar
[ ] Flutter: pindah ke git submodule resmi
[ ] PostgreSQL: jalankan migrasi data Firestore → PostgreSQL (lihat MIGRATION.md)
[ ] PostgreSQL: update role enum di schema Prisma
[ ] PostgreSQL: dual-write period sebelum full cutover
[ ] Staging: buat Vercel project terpisah untuk testing
[ ] Zilliz: setup collection news_embeddings untuk semantic search
[ ] WebSocket: pastikan deploy ke server persistent (Railway/Fly.io, bukan Vercel serverless)
```

---

## RENCANA MIGRASI POSTGRESQL (Detail)

> Panduan lengkap: [MIGRATION.md](./MIGRATION.md)
> Status saat ini: Firestore = aktif, PostgreSQL = standby (schema ada)

### Urutan yang aman:

**Fase 1 — Persiapan (butuh dilakukan manual):**
1. Buat database di Neon.tech atau Supabase (free tier cukup)
2. Tambahkan `DATABASE_URL` ke Vercel env dan GitHub secrets
3. Jalankan `npx prisma migrate deploy` (lihat item #3 di atas)

**Fase 2 — Dual-write (AI bisa bantu coding):**
4. Update service layer untuk menulis ke KEDUANYA (Firestore + PostgreSQL)
5. Verifikasi data konsisten selama 1-2 minggu

**Fase 3 — Cutover (butuh approval manual):**
6. Tandai Firestore sebagai read-only
7. Switch primary source ke PostgreSQL
8. Update semua query dari FirebaseService ke PrismaService
9. End-to-end testing

**Fase 4 — Cleanup:**
10. Hapus FirebaseService dari modul yang sudah dimigrasi
11. Update Prisma schema role enum ke 8 level baru
12. Archive Firestore collections

---

## RENCANA FLUTTER PRODUCTION

> Status saat ini: code ada di `tools/mobile-simulator`, belum production-ready

### Yang harus dilakukan (manual):

1. **Buat repo terpisah** untuk Flutter app:
   ```bash
   # Di GitHub: buat repo baru newgame-flutter
   # Lalu di lokal:
   git init tools/mobile-simulator
   git remote add origin https://github.com/rannymphaea/newgame-flutter.git
   git push -u origin main
   ```

2. **Register sebagai submodule:**
   ```bash
   git submodule add https://github.com/rannymphaea/newgame-flutter.git tools/mobile-simulator
   ```

3. **Tambahkan Firebase ke Flutter:**
   - Download `google-services.json` dari Firebase Console
   - Letakkan di `tools/mobile-simulator/android/app/`

4. **Build APK untuk testing:**
   ```bash
   cd tools/mobile-simulator
   flutter pub get
   flutter build apk --debug
   # Output: build/app/outputs/flutter-apk/app-debug.apk
   ```

5. **Aktifkan WebSocket (push notif):**
   - Tambahkan package `socket_io_client: ^2.0.3` ke pubspec.yaml
   - Implementasikan koneksi ke `wss://api.unandnewgame.vercel.app`
   - Handle event `notification` dari NotificationsGateway

6. **Firebase Cloud Messaging (opsional):**
   - Setup FCM di Firebase Console
   - Tambahkan `firebase_messaging` ke Flutter
   - Register token di backend saat login

---

## RENCANA DOCKER PRODUCTION

> Status saat ini: Dockerfile dan docker-compose.yml ada, belum fully tested

### Testing yang perlu dilakukan (manual):

1. **Test di WSL2 (Windows):**
   ```bash
   # Buka WSL2
   cd /mnt/c/Users/lenovo/web-ua-newgame
   docker compose up --build
   ```
   Cek: API port 3001, Web port 3000, Redis port 6379

2. **Known issues yang mungkin muncul:**
   - Volume mount: `./apps/api:/app` mungkin perlu path adjustment di Windows
   - Hot reload: tambahkan `CHOKIDAR_USEPOLLING=true` di Dockerfile Web
   - Startup order: pastikan `depends_on: redis` sudah ada di docker-compose.yml

3. **Untuk production Docker:**
   - Gunakan multi-stage build untuk image kecil
   - Set `NODE_ENV=production`
   - Jangan mount volume di production (copy only)

4. **Deploy ke Railway via Docker:**
   ```bash
   railway login
   railway init
   railway up --dockerfile apps/api/Dockerfile
   ```

---

*NEWGAME v0.1.5 — UKM Game Development, Universitas Andalas*
*Dibuat: 15 Juni 2026*
*Perbarui dokumen ini setiap kali ada tugas manual baru.*
