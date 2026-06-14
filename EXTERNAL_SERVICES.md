EXTERNAL_SERVICES.md
NEWGAME UKM Game Development, Universitas Andalas
Diperbarui: 15 Juni 2026

Dokumen ini mencatat semua layanan eksternal yang digunakan atau direncanakan
oleh platform NEWGAME. Setiap layanan dijelaskan fungsinya, cara pakainya di
codebase, variabel env yang dibutuhkan, dan status saat ini.

---

LAYANAN AKTIF (sudah berjalan di production)

---

Firebase Firestore

  Fungsi   : database utama platform, menyimpan semua data operasional
  Peran    : sumber data aktif -- semua baca/tulis data lewat Firestore
  Provider : Google Firebase (project qr-absensi-unandnewgame)
  Free?    : ada free tier (Spark), tapi bisa kena limit kalau traffic tinggi

  Koleksi yang dipakai:
    members      -> data administrasi anggota (Member ID, nama, pilar)
    users        -> akun login (email, role, XP, avatar)
    events       -> event kegiatan (nama, waktu, XP reward)
    attendance   -> riwayat presensi per anggota per event
    tokens       -> QR token untuk presensi
    logs         -> forensic activity log
    media        -> referensi file media di Cloudinary
    user_history -> timeline aktivitas anggota
    user_vault   -> data sensitif

  Dipakai di kode:
    apps/api/src/firebase/firebase.service.ts -> FirebaseService
    semua modul backend pakai FirebaseService untuk baca/tulis data

  Env yang dibutuhkan:
    FIREBASE_PROJECT_ID
    FIREBASE_CLIENT_EMAIL
    FIREBASE_PRIVATE_KEY
    atau letakkan serviceAccountKey.json di apps/api/

  Setup:
    1. Buka console.firebase.google.com
    2. Project Settings -> Service Accounts -> Generate new private key
    3. Salin nilai ke env, atau simpan file sebagai serviceAccountKey.json

  Yang perlu dicek:
    - Firestore rules: pastikan rules tidak terlalu terbuka (lihat firestore.rules)
    - Quota: cek Firebase Console -> Usage untuk melihat apakah mendekati batas
    - Index: kalau query lambat, cek apakah perlu tambah composite index

---

Firebase Auth

  Fungsi   : autentikasi pengguna (login, registrasi, OAuth, token)
  Peran    : semua login dan verifikasi token di backend menggunakan Firebase Auth
  Provider : Google Firebase (project yang sama)

  Metode yang aktif:
    - Email + password
    - Google OAuth
    - login via Member ID (lookup ke Firestore, lalu signIn via email)

  Dipakai di kode:
    apps/web/src/lib/firebase.ts        -> inisialisasi Firebase di frontend
    apps/api/src/common/guards/firebase-auth.guard.ts -> verifikasi token di setiap request
    apps/web/src/store/auth.store.ts    -> Zustand store untuk state autentikasi

  Env yang dibutuhkan (frontend):
    NEXT_PUBLIC_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID

  Yang perlu dicek:
    - Email verification: apakah email verifikasi aktif di Authentication settings
    - Password reset template: sesuaikan template email reset di Firebase Console
    - Authorized domains: tambahkan domain production ke Authentication -> Settings

---

Vercel

  Fungsi   : hosting frontend (Next.js) dan backend (NestJS sebagai serverless functions)
  Peran    : deployment otomatis dari GitHub main branch
  URL      : https://unandnewgame-tan.vercel.app
  Free?    : ada free tier, cukup untuk awal

  Yang perlu diketahui:
    - Backend (NestJS) di-deploy sebagai serverless function
    - WebSocket TIDAK bisa jalan di Vercel serverless (stateless)
    - Kalau butuh WebSocket real-time, API harus pindah ke Railway atau Fly.io
    - vercel.json mengatur rewrite agar /api/* diteruskan ke backend

  Konfigurasi env di Vercel:
    Buka vercel.com/rannymphaea -> Project -> Settings -> Environment Variables
    Semua env di apps/api/.env dan apps/web/.env.local perlu diisi di sini

  Yang perlu dicek:
    - Build logs setelah setiap push ke main
    - Function timeout: default 10 detik, mungkin perlu ditambah untuk operasi berat
    - Edge config: pertimbangkan untuk rate limiting di edge

---

Upstash Redis

  Fungsi   : caching dan rate limiting
  Peran    : leaderboard di-cache dengan TTL 60 detik; rate limiter pakai Redis
             sebagai backend utama (fallback ke memory kalau Redis tidak tersedia)
  Provider : upstash.com, serverless Redis dengan billing per request
  Free?    : ada free tier (10.000 command per hari)

  Dipakai di kode:
    apps/api/src/common/guards/rate-limit.guard.ts -> rate limiting
    apps/api/src/modules/xp/xp.service.ts          -> cache leaderboard

  Env yang dibutuhkan:
    UPSTASH_REDIS_REST_URL
    UPSTASH_REDIS_REST_TOKEN

  Setup:
    1. Buat akun di upstash.com
    2. Create Database -> pilih region terdekat (Singapore)
    3. Salin REST URL dan REST Token ke env

  Yang perlu dicek:
    - Daily command usage di Upstash dashboard (jangan sampai kena limit free tier)
    - TTL cache leaderboard: sekarang 60 detik, sesuaikan jika perlu

---

PostHog

  Fungsi   : analytics penggunaan aplikasi (page view, click, session recording)
  Peran    : melacak interaksi pengguna, error rate, dan funnel penggunaan fitur
  Provider : posthog.com, ada self-hosted atau cloud
  Free?    : ada free tier (1 juta event per bulan)

  Dipakai di kode:
    apps/web/src/components/providers/PostHogProvider.tsx -> provider utama
    apps/web/src/components/ui/ErrorBoundary.tsx          -> lapor error ke PostHog

  Env yang dibutuhkan:
    NEXT_PUBLIC_POSTHOG_KEY
    NEXT_PUBLIC_POSTHOG_HOST (default: https://app.posthog.com)

  Setup:
    1. Daftar di posthog.com
    2. Create project -> salin Project API Key
    3. Isi ke env NEXT_PUBLIC_POSTHOG_KEY

  Yang perlu dicek:
    - Dashboard PostHog: lihat page view, session, dan error yang dilaporkan
    - Privacy: pertimbangkan untuk disable session recording jika perlu

---

LAYANAN YANG BUTUH SETUP (ada di kode, env belum diisi)

---

Cloudinary

  Fungsi   : penyimpanan dan pengoptimalan media (gambar dan video)
  Peran    : semua upload file (foto profil, cover artikel, video) disimpan di Cloudinary
  Provider : cloudinary.com
  Free?    : ada free tier (25 GB storage, 25 GB bandwidth per bulan)

  Dipakai di kode:
    apps/api/src/modules/media/media.service.ts  -> upload, delete, list media
    uploadVideo() untuk video (maks 100MB, mp4/webm/mov)
    upload_stream untuk gambar via buffer

  Folder yang dibuat otomatis:
    media/avatar/{userId}  -> foto profil anggota
    media/videos/{userId}  -> video yang diupload anggota
    media/content          -> gambar konten (cover artikel, dll)

  Env yang dibutuhkan:
    CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET

  Setup:
    1. Daftar di cloudinary.com
    2. Dashboard -> Settings -> Access Keys
    3. Salin Cloud Name, API Key, API Secret ke env

  Yang perlu dicek:
    - Setelah env diisi, test upload foto profil dari halaman /profile
    - Cek Cloudinary dashboard -> Media Library untuk memastikan file masuk

---

SMTP / Email

  Fungsi   : kirim email transaksional (notifikasi, reminder event, reset password)
  Peran    : Nodemailer dipakai sebagai transport, bisa pakai layanan apapun yang punya SMTP
  Provider : bisa Gmail, Mailgun, SendGrid, atau provider lain

  Dipakai di kode:
    apps/api/src/modules/notifications/notifications.service.ts
    method sendEmail() dan sendEventReminder()

  Env yang dibutuhkan:
    SMTP_HOST   -> misal smtp.gmail.com
    SMTP_PORT   -> 587 (TLS) atau 465 (SSL)
    SMTP_USER   -> email pengirim
    SMTP_PASS   -> password atau app password
    SMTP_FROM   -> misal: NEWGAME <nama@email.com>

  Opsi Gmail (paling mudah untuk awal):
    1. Aktifkan 2FA di akun Gmail yang akan dipakai
    2. Google Account -> Security -> App Passwords -> buat untuk Mail
    3. Gunakan 16-karakter app password sebagai SMTP_PASS

  Opsi Mailgun (lebih baik untuk production):
    1. Daftar di mailgun.com
    2. Verifikasi domain
    3. Ambil SMTP credentials dari Sending -> Domain settings

  Yang perlu dicek:
    - Test kirim email setelah env diisi dengan cara trigger reset password
    - Cek spam folder jika email tidak masuk

---

LAYANAN YANG DIRENCANAKAN (belum aktif)

---

PostgreSQL via Neon atau Supabase

  Fungsi   : database relasional untuk menggantikan Firestore di masa depan
  Peran    : menyimpan data terstruktur dengan relasi antar tabel, query lebih fleksibel
  Provider : neon.tech (serverless PostgreSQL, recommended) atau supabase.com
  Status   : schema Prisma sudah ada, data belum dipindahkan

  Kenapa pindah dari Firestore:
    - Query yang kompleks (join, agregasi) lebih mudah di SQL
    - Relasi antar data lebih terjamin (foreign key, constraint)
    - Export dan analisis data lebih mudah dengan SQL
    - Biaya lebih prediktif

  Tabel yang sudah ada di schema.prisma:
    users, user_profiles, sessions, events, attendances,
    news_articles, xp_history, activities, notifications

  Env yang dibutuhkan:
    DATABASE_URL    -> connection string lengkap dengan sslmode=require
    DIRECT_URL      -> sama, untuk migration (Neon memerlukan ini)

  Setup Neon:
    1. Buat akun di neon.tech
    2. Create project -> salin connection string
    3. Jalankan npx prisma migrate deploy di mesin dengan akses ke URL tersebut

  Untuk migrasi data dari Firestore ke PostgreSQL, lihat MIGRATION.md

---

Zilliz / Milvus (vector database)

  Fungsi   : menyimpan embedding teks untuk pencarian semantik
  Peran    : pencarian berita berdasarkan makna (bukan keyword), rekomendasi konten
  Provider : zilliz.com (cloud-managed Milvus), ada free tier
  Status   : koneksi sudah ada di kode (ai.service.ts), collection belum dibuat

  Cara kerja:
    1. Artikel dibuat -> teks di-embed jadi vektor 1536 dimensi via OpenAI
    2. Vektor disimpan di Zilliz collection news_embeddings
    3. User search -> query di-embed -> cari vektor terdekat -> kembalikan artikel

  Dipakai di kode:
    apps/api/src/modules/ai/ai.service.ts -> VectorService, koneksi Milvus

  Env yang dibutuhkan:
    ZILLIZ_URI    -> endpoint cluster Zilliz
    ZILLIZ_TOKEN  -> API token Zilliz

  Setup:
    1. Buat akun di zilliz.com
    2. Create Cluster -> Free tier (M0)
    3. Create Collection: news_embeddings
       fields: id (varchar pk), title (varchar), content (varchar),
               embedding (float_vector, dim=1536)
    4. Enable indexing pada field embedding (HNSW atau IVF_FLAT)
    5. Salin URI dan Token ke env

---

OpenAI API

  Fungsi   : membuat text embedding untuk vector search
  Peran    : mengubah teks artikel menjadi vektor angka yang bisa dicari secara semantik
  Provider : platform.openai.com
  Status   : env sudah ada di template, belum diisi

  Dipakai di kode:
    apps/api/src/modules/ai/ai.service.ts

  Env yang dibutuhkan:
    OPENAI_API_KEY -> sk-...

  Model yang dipakai: text-embedding-3-small (1536 dimensi, murah)
  Biaya: $0.02 per 1 juta token (sangat murah untuk embedding)

  Catatan: kalau tidak mau pakai OpenAI, bisa diganti dengan model embedding
  lokal (sentence-transformers) tapi perlu infrastruktur tambahan.

---

Groq API

  Fungsi   : LLM inference cepat (alternatif OpenAI untuk generasi teks)
  Peran    : saat ini direncanakan untuk fitur AI generatif (rangkuman, rekomendasi)
  Provider : groq.com, ada free tier
  Status   : env ada di template, belum diimplementasikan di modul apapun

  Env yang dibutuhkan:
    GROQ_API_KEY -> gsk_...

  Catatan: ada riwayat bug di v0.1.1 di mana key ini di-console.log secara tidak sengaja.
  Bug sudah diperbaiki. Pastikan tidak ada console.log(GROQ_API_KEY) di kode.

---

Google Cloud Console (OAuth)

  Fungsi   : menyediakan OAuth 2.0 untuk Sign in with Google
  Peran    : pengguna bisa login tanpa buat password, cukup dengan akun Google
  Status   : perlu tambah redirect URI untuk production

  Yang perlu dicek dan diisi:
    console.cloud.google.com -> APIs & Services -> Credentials -> OAuth 2.0 Client
    Tambahkan ke Authorized Redirect URIs:
      http://localhost:3000/api/auth/callback/google
      https://unandnewgame-tan.vercel.app/api/auth/callback/google

---

GitHub Actions

  Fungsi   : CI/CD otomatis dan backup database
  Peran    : typecheck, audit, lint setiap push; backup PostgreSQL setiap hari
  Status   : aktif, tapi backup.yml butuh secret DATABASE_URL

  Workflow yang ada:
    .github/workflows/ci.yml     -> typecheck, npm audit, ESLint saat push ke main
    .github/workflows/backup.yml -> backup PostgreSQL setiap hari 02.00 WIB

  Yang perlu dicek:
    Tambahkan DATABASE_URL sebagai Repository Secret di:
    github.com/rannymphaea/web-ua-newgame -> Settings -> Secrets -> Actions

---

ringkasan status semua layanan

  Aktif dan berjalan:
    Firebase Firestore  -> sumber data utama
    Firebase Auth       -> autentikasi semua pengguna
    Vercel              -> hosting production
    Upstash Redis       -> cache + rate limit
    PostHog             -> analytics
    GitHub Actions      -> CI/CD

  Butuh env / setup:
    Cloudinary          -> upload media (perlu CLOUDINARY_* env)
    SMTP email          -> notifikasi email (perlu SMTP_* env)
    Google OAuth        -> perlu tambah redirect URI di Google Console

  Direncanakan:
    PostgreSQL (Neon)   -> ganti Firestore, schema sudah ada
    Zilliz / Milvus     -> pencarian semantik, collection belum dibuat
    OpenAI API          -> embedding untuk pencarian, perlu OPENAI_API_KEY
    Groq API            -> LLM generatif, belum diimplementasikan

---

NEWGAME v0.1.5 -- UKM Game Development, Universitas Andalas
