MANUAL_TASKS.md
NEWGAME UKM Game Development, Universitas Andalas
Diperbarui: 15 Juni 2026

Dokumen ini berisi semua tugas yang tidak bisa dikerjakan otomatis oleh AI atau CI/CD.
Setiap item butuh akses manusia langsung: credential, cloud console, distribusi fisik,
atau keputusan arsitektur.

Tanggung jawab: Code Commander / Pixel Presiden / DevOps.

Untuk daftar layanan eksternal beserta cara pakai dan fungsinya, lihat EXTERNAL_SERVICES.md.

Keterangan:
  [!] wajib sebelum platform bisa jalan di production
  [~] perlu untuk fitur tertentu berfungsi
  [-] opsional, tidak memblokir fitur utama

---

wajib sebelum go-live

  [!] seed data anggota ke Firestore
      Tanpa ini tidak ada anggota yang bisa registrasi.

      FIREBASE_PROJECT_ID=xxx \
      FIREBASE_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com \
      FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" \
        node apps/api/src/scripts/seed-members.js

      Cek: Firebase Console -> Firestore -> koleksi members -> harus ada 125 dokumen.

  [!] distribusi kredensial ke anggota
      Setiap anggota butuh Member ID dan Kode Akses untuk bisa registrasi.
      1. Buka MEMBER_CREDENTIALS.md
      2. Isi tempPassword tiap anggota
      3. Kirim via WhatsApp group, Discord, atau kertas fisik

      Format yang dikirim ke anggota:
        Member ID  : NG11020001PG
        Kode Akses : TempPass123!
        URL Daftar : https://unandnewgame-tan.vercel.app/login

  [!] jalankan Prisma migration di database production
      Tanpa ini fitur yang bergantung PostgreSQL tidak bisa jalan.

      cd apps/api
      DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require" \
        npx prisma migrate deploy

      Platform: Neon (neon.tech) atau Supabase, free tier cukup untuk awal.
      Cek: npx prisma db pull -- tidak boleh ada error.

  [!] isi environment variables di Vercel
      Buka: vercel.com/rannymphaea -> Project -> Settings -> Environment Variables

      Frontend (apps/web):
        NEXT_PUBLIC_API_URL          -> URL backend API
        NEXT_PUBLIC_FIREBASE_API_KEY -> dari Firebase Console
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        NEXT_PUBLIC_FIREBASE_PROJECT_ID
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
        NEXT_PUBLIC_FIREBASE_APP_ID
        NEXT_PUBLIC_POSTHOG_KEY      -> dari PostHog dashboard
        NEXT_PUBLIC_SITE_URL         -> https://unandnewgame-tan.vercel.app

      Backend (apps/api):
        FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
        DATABASE_URL                 -> connection string PostgreSQL
        CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
        UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN
        OPENAI_API_KEY               -> untuk fitur AI/embedding
        ZILLIZ_URI, ZILLIZ_TOKEN     -> untuk semantic search
        SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

      Detail tiap variabel ada di EXTERNAL_SERVICES.md.

---

penting untuk fitur tertentu

  [~] Google OAuth redirect URI
      Tanpa ini tombol Sign in with Google tidak berfungsi.
      1. Buka console.cloud.google.com
      2. APIs & Services -> Credentials -> OAuth 2.0 Client IDs
      3. Edit client, tambahkan Authorized Redirect URIs:
           http://localhost:3000/api/auth/callback/google
           https://unandnewgame-tan.vercel.app/api/auth/callback/google
      4. Save, tunggu beberapa menit untuk propagasi

  [~] Cloudinary account
      Tanpa ini upload foto, video, dan cover artikel tidak berfungsi.
      1. Buat akun di cloudinary.com (free tier cukup)
      2. Dashboard -> Settings -> Access Keys
      3. Salin Cloud Name, API Key, API Secret ke Vercel env

      Folder yang dibuat otomatis di Cloudinary:
        media/avatar/{userId}  -> foto profil
        media/videos/{userId}  -> video upload
        media/content          -> gambar konten

  [~] SMTP email
      Tanpa ini email notifikasi, reminder event, dan reset password tidak terkirim.

      Opsi 1 - Gmail App Password (untuk skala kecil / dev):
        Aktifkan 2FA di Gmail -> Google Account -> Security -> App Passwords
        SMTP_HOST=smtp.gmail.com, SMTP_PORT=587

      Opsi 2 - Mailgun atau SendGrid (untuk production):
        Daftar, verifikasi domain, ambil SMTP credentials dari dashboard.

  [~] GitHub secret untuk backup otomatis
      1. Buka github.com/rannymphaea/web-ua-newgame -> Settings -> Secrets -> Actions
      2. Tambahkan secret DATABASE_URL dengan connection string production
      Efek: backup jalan otomatis setiap hari 02.00 WIB via backup.yml

---

opsional

  [-] migrasi role di Firestore (hanya jika ada user dengan role lama)
      node scripts/migrate-firestore.mjs --collection users --dry-run
      Jika hasilnya benar:
      node scripts/migrate-firestore.mjs --collection users

      Mapping:
        superadmin -> code commander
        presiden   -> pixel presiden
        pengurus   -> member

  [-] Flutter submodule resmi
      Saat ini embedded biasa, bukan git submodule resmi.

      git rm --cached tools/mobile-simulator
      git submodule add https://github.com/rannymphaea/newgame-flutter.git tools/mobile-simulator
      git commit -m "chore: flutter jadi submodule resmi"

  [-] setup Zilliz / Milvus untuk AI search
      1. Buat cluster di zilliz.com
      2. Buat collection news_embeddings:
           field: id (varchar), title (varchar), content (varchar),
                  embedding (float_vector, dim=1536)
      3. Salin URI dan Token ke env ZILLIZ_URI dan ZILLIZ_TOKEN
      4. Test via endpoint /ai/test-connection

  [-] anomaly alerting via webhook
      1. Buat webhook di PagerDuty atau OpsGenie
      2. Tambahkan ALERT_WEBHOOK_URL ke environment
      3. Update anomaly.service.ts untuk panggil webhook saat score > 0.85

  [-] post-quantum cryptography
      Interface placeholder sudah ada. Butuh library liboqs-node dan
      keputusan arsitektur sebelum implementasi. Tidak urgent untuk v0.x.

---

rencana migrasi PostgreSQL (4 fase)

  Panduan lengkap: MIGRATION.md
  Status: Firestore aktif, PostgreSQL standby (schema ada)

  Fase 1 -- persiapan (manual):
    1. Buat database di Neon.tech atau Supabase
    2. Tambahkan DATABASE_URL ke Vercel env dan GitHub secrets
    3. Jalankan npx prisma migrate deploy

  Fase 2 -- dual-write (bisa dibantu AI):
    4. Update service layer tulis ke Firestore DAN PostgreSQL sekaligus
    5. Verifikasi data konsisten selama 1-2 minggu

  Fase 3 -- cutover (butuh approval manual):
    6. Tandai Firestore sebagai read-only
    7. Ganti primary source ke PostgreSQL
    8. Update semua query FirebaseService -> PrismaService
    9. Testing end-to-end

  Fase 4 -- cleanup:
    10. Hapus FirebaseService dari modul yang sudah dimigrasi
    11. Update enum role di schema Prisma ke 8 level baru
    12. Archive koleksi Firestore

---

rencana Flutter production

  Status: code ada di tools/mobile-simulator, belum siap distribusi

  1. Buat repo terpisah di GitHub (newgame-flutter)
     git init tools/mobile-simulator
     git remote add origin https://github.com/rannymphaea/newgame-flutter.git
     git push -u origin main

  2. Register sebagai submodule di repo utama
     git submodule add https://github.com/rannymphaea/newgame-flutter.git tools/mobile-simulator

  3. Tambahkan Firebase ke Flutter:
     Download google-services.json dari Firebase Console
     Letakkan di tools/mobile-simulator/android/app/

  4. Build APK debug untuk testing:
     cd tools/mobile-simulator
     flutter pub get
     flutter build apk --debug
     Hasil: build/app/outputs/flutter-apk/app-debug.apk

  5. Aktifkan WebSocket (push notif):
     Tambahkan socket_io_client: ^2.0.3 ke pubspec.yaml
     Koneksi ke wss://api.unandnewgame.vercel.app
     Handle event notification dari NotificationsGateway

  6. FCM (opsional):
     Setup di Firebase Console, tambahkan firebase_messaging ke Flutter
     Register token di backend saat login

---

rencana Docker production

  Status: Dockerfile dan docker-compose.yml ada, belum diuji end-to-end

  Testing di WSL2 (Windows):
    Buka WSL2, masuk ke folder proyek
    docker compose up --build
    Cek: API port 3001, Web port 3000, Redis port 6379

  Masalah yang mungkin muncul:
    - Volume mount: path adjustment perlu di Windows
    - Hot reload: tambah CHOKIDAR_USEPOLLING=true di Dockerfile Web
    - Startup: depends_on: redis harus ada di docker-compose.yml

  Untuk production (Railway via Docker):
    railway login
    railway init
    railway up --dockerfile apps/api/Dockerfile

---

checklist sebelum go-live

  [ ] seed Firestore (125 anggota)
  [ ] distribusi kredensial ke semua anggota
  [ ] prisma migrate deploy di database production
  [ ] semua env variables terisi di Vercel
  [ ] Google OAuth redirect URI terdaftar
  [ ] Cloudinary credentials valid (test upload foto)
  [ ] SMTP email berfungsi (test kirim email)
  [ ] GitHub secret DATABASE_URL untuk backup
  [ ] test login semua metode (email, Member ID, Google)
  [ ] test QR scan dari HP (buka /scan)
  [ ] test panel admin (buat event, import member, cek SIEM)
  [ ] monitor Vercel logs 30 menit pertama

checklist infra lanjutan

  [ ] Docker: uji di WSL2 atau Linux
  [ ] Flutter: build APK debug, install di HP
  [ ] Flutter: pindah ke submodule resmi
  [ ] PostgreSQL: jalankan migrasi data (lihat MIGRATION.md)
  [ ] PostgreSQL: update role enum di schema Prisma
  [ ] Staging: buat Vercel project terpisah
  [ ] Zilliz: setup collection untuk semantic search
  [ ] WebSocket: deploy ke server persistent (Railway/Fly.io, bukan Vercel)

---

NEWGAME v0.1.5 -- UKM Game Development, Universitas Andalas
