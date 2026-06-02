# NEWGAME V1.1 — Dokumentasi Arsitektur dan API

Dokumen ini mendokumentasikan sistem autentikasi, manajemen pengguna, arsitektur database relasional, standar respons API, dan strategi caching pada platform NEWGAME V1.1.

---

### Matriks Peran dan Izin Akses

Platform mengadopsi 6 tingkatan role berbasis hierarki organisasi UKM Game Development Universitas Andalas:

| Peran | Kemampuan Utama | Level Akses |
|---|---|---|
| OWNER | Kendali penuh infrastruktur, billing, dan semua pengaturan sistem | Level 5 |
| ADMIN | Manajemen role user, log forensik, dasbor AI analytics | Level 4 |
| TRAINER | Manajemen modul belajar, pembuatan event, input absensi manual | Level 3 |
| SOLDAT | Membuat artikel berita, mengelola galeri media | Level 2 |
| ASSOCIATE | Anggota tingkat lanjut, akses modul proyek khusus | Level 1 |
| TRAINEE | Anggota baru. Akses absensi, leaderboard, dan riwayat XP | Level 0 |

---

### Standar Respons API

Semua endpoint REST API diproses melalui `ResponseInterceptor` yang terdaftar secara global di `main.ts`.

#### Respons Sukses

```json
{
  "success": true,
  "data": {
    "id": "cuid-user-123",
    "email": "trainee@newgame.ac.id",
    "displayName": "Budi Santoso"
  },
  "timestamp": "2026-06-02T09:30:00.000Z"
}
```

#### Respons Error

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Member ID tidak valid atau sudah terdaftar.",
    "path": "/api/auth/register",
    "timestamp": "2026-06-02T09:30:05.000Z"
  }
}
```

#### Respons Berhalaman

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 87
  },
  "timestamp": "2026-06-02T09:30:00.000Z"
}
```

---

### Daftar Endpoint API

#### Autentikasi — `/api/auth`

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/verify-member` | Publik | Verifikasi Member ID dan kode akses sebelum registrasi |
| POST | `/api/auth/register` | Authenticated | Buat profil setelah Firebase Auth registration |
| GET | `/api/auth/me` | Authenticated | Ambil profil user yang sedang login |
| POST | `/api/auth/set-role` | Admin, Owner | Ubah role user tertentu |
| GET | `/api/auth/users` | Owner | Ambil seluruh daftar user |
| POST | `/api/auth/register-admin` | Owner | Buat akun admin baru |

#### Anggota — `/api/members`

Semua endpoint memerlukan autentikasi dan hak akses admin atau owner.

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/members` | Daftar semua anggota (filter dan pagination) |
| GET | `/api/members/:uid` | Detail satu anggota beserta riwayat aktivitas |
| POST | `/api/members` | Tambah anggota baru satu per satu |
| POST | `/api/members/import` | Import anggota massal via CSV atau JSON |
| PATCH | `/api/members/:uid` | Perbarui data anggota |
| DELETE | `/api/members/:uid` | Nonaktifkan anggota (soft delete) |

---

### Skema Database Relasional

File skema: `apps/api/prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  displayName String?
  role        Role     @default(TRAINEE)
  nim         String?
  photoUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  profile    UserProfile?
  sessions   Session[]
  activities Activity[]

  @@map("users")
}

enum Role {
  TRAINEE
  ASSOCIATE
  TRAINER
  SOLDAT
  ADMIN
  OWNER
}

model UserProfile {
  id       String   @id @default(cuid())
  userId   String   @unique
  bio      String?
  github   String?
  linkedin String?
  skills   String[]
  exp      Int      @default(0)
  level    Int      @default(1)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model NewsArticle {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String    @db.Text
  excerpt     String?
  coverUrl    String?
  published   Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("news_articles")
}

model Activity {
  id          String   @id @default(cuid())
  userId      String
  type        String
  title       String
  description String?
  expGained   Int      @default(0)
  date        DateTime

  user User @relation(fields: [userId], references: [id])

  @@map("activities")
}
```

---

### Strategi Caching (Upstash Redis)

```
[ Request Masuk ]
        |
  RateLimitGuard
  (100 req/min per IP)
        |
  Cek Redis Cache
     /       \
  HIT         MISS
   |            |
Balas       Query PostgreSQL
Instan           |
           Tulis ke Redis
                 |
           Balas ke Client
```

Kunci cache dan TTL:

| Kunci Cache | Data | TTL |
|---|---|---|
| `leaderboard:all` | Data leaderboard global | 60 detik |
| `news:published` | Daftar artikel berita publik | 300 detik |
| `user:{id}:profile` | Profil detail per pengguna | 60 detik |
| `ip:{address}:count` | Counter rate limiter per IP | 60 detik |

---

### Alur Autentikasi (Better Auth)

```
[ Frontend Next.js ]                 [ Backend NestJS ]
        |                                    |
  Kirim Kredensial  --- POST /api/auth/me --> |
        |                                    |
        |                           Verifikasi dan buat sesi
        |                           di tabel sessions PostgreSQL
        |                                    |
        | <-- Set Cookie Session Token ----- |
        |
  Simpan ke Zustand Store
  Akses halaman dashboard
```

Mekanisme autentikasi:

1. Email dan Password — Password di-hash menggunakan bcrypt (work factor 10) sebelum disimpan ke PostgreSQL.
2. Google OAuth — Callback URL valid: `http://localhost:3000/api/auth/callback/google` (development) dan `https://unandnewgame-tan.vercel.app/api/auth/callback/google` (production).
3. Session Guard — FirebaseAuthGuard (legacy) dan BetterAuthGuard mengamankan semua route API sensitif.
