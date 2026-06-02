# NEWGAME V2 — Dokumentasi Arsitektur dan API

Dokumen ini mendokumentasikan sistem autentikasi, manajemen pengguna, arsitektur database relasional, standar respons API, dan strategi caching pada platform **NEWGAME V2**.

---

## Matriks Peran dan Izin Akses

Platform mengadopsi 6 tingkatan role berbasis hierarki organisasi UKM Game Development Universitas Andalas:

| Peran | Kemampuan Utama | Level Akses |
|---|---|---|
| `OWNER` | Kendali penuh infrastruktur, billing, dan semua pengaturan sistem | Level 5 |
| `ADMIN` | Manajemen role user, log forensik, dasbor AI analytics | Level 4 |
| `TRAINER` | Manajemen modul belajar, pembuatan event, input absensi manual | Level 3 |
| `SOLDAT` | Membuat artikel berita, mengelola galeri media | Level 2 |
| `ASSOCIATE` | Anggota tingkat lanjut, akses modul proyek khusus | Level 1 |
| `TRAINEE` | Anggota baru. Akses absensi, leaderboard, dan riwayat XP | Level 0 |

---

## Standar Respons API

Semua endpoint REST API diproses secara terpusat melalui `ResponseInterceptor` yang terdaftar secara global di `main.ts`. Ini menjamin format respons yang seragam di seluruh sistem.

### Respons Sukses

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

### Respons Error

Ditangani oleh `AllExceptionsFilter` yang terdaftar secara global:

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

### Respons Berhalaman (Paginated)

Untuk endpoint yang mengembalikan daftar data:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 87
  },
  "timestamp": "2026-06-02T09:30:00.000Z"
}
```

---

## Daftar Endpoint API

### Autentikasi — `/api/auth`

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/verify-member` | Publik | Verifikasi Member ID + kode akses sebelum registrasi |
| `POST` | `/api/auth/register` | Authenticated | Buat profil setelah Firebase Auth registration |
| `GET` | `/api/auth/me` | Authenticated | Ambil profil user yang sedang login |
| `POST` | `/api/auth/set-role` | Admin, Owner | Ubah role user tertentu |
| `GET` | `/api/auth/users` | Owner | Ambil seluruh daftar user |
| `POST` | `/api/auth/register-admin` | Owner | Buat akun admin baru |

### Anggota — `/api/members`

Semua endpoint ini memerlukan autentikasi dan hak akses `superadmin` / `admin`.

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/members` | Daftar semua anggota (dengan filter dan pagination) |
| `GET` | `/api/members/:uid` | Detail satu anggota beserta riwayat aktivitas |
| `POST` | `/api/members` | Tambah anggota baru satu per satu |
| `POST` | `/api/members/import` | Import anggota massal via CSV atau JSON |
| `PATCH` | `/api/members/:uid` | Perbarui data anggota |
| `DELETE` | `/api/members/:uid` | Nonaktifkan anggota (soft delete) |

---

## Skema Database Relasional (PostgreSQL via Prisma)

File skema: `apps/api/prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// 1. Akun Pengguna Utama
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

// 2. Profil Detail Anggota (Gamifikasi)
model UserProfile {
  id      String   @id @default(cuid())
  userId  String   @unique
  bio     String?
  github  String?
  linkedin String?
  skills  String[]
  exp     Int      @default(0)
  level   Int      @default(1)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

// 3. Sesi Login (Better Auth)
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// 4. Artikel Berita dan Tutorial
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

// 5. Log Aktivitas dan Kehadiran
model Activity {
  id          String   @id @default(cuid())
  userId      String
  type        String   // 'weekly_study' | 'event' | 'project' | 'competition'
  title       String
  description String?
  expGained   Int      @default(0)
  date        DateTime

  user User @relation(fields: [userId], references: [id])

  @@map("activities")
}
```

---

## Strategi Caching (Upstash Redis)

Untuk meminimalkan beban query langsung ke PostgreSQL, setiap request API melewati lapisan caching:

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

### Kunci Cache dan TTL

| Kunci Cache | Data | TTL |
|---|---|---|
| `leaderboard:all` | Data leaderboard global | 60 detik |
| `news:published` | Daftar artikel berita publik | 300 detik |
| `user:{id}:profile` | Profil detail per pengguna | 60 detik |
| `ip:{address}:count` | Counter rate limiter per IP | 60 detik |

Cache pada kunci `user:{id}:profile` akan dihapus secara otomatis (cache invalidation) setiap kali pengguna memperbarui data profilnya.

---

## Alur Autentikasi (Better Auth)

```
[ Frontend Next.js ]                 [ Backend NestJS ]
        |                                    |
  Kirim Kredensial  --- POST /api/auth/me --> |
        |                                    |
        |                           Verifikasi & buat sesi
        |                           di tabel `sessions` PostgreSQL
        |                                    |
        | <-- Set Cookie Session Token ----- |
        |
  Simpan ke Zustand Store
  Akses halaman dashboard
```

**Detail Mekanisme:**

1. **Email & Password** — Password di-hash menggunakan `bcrypt` (work factor 10) sebelum disimpan ke PostgreSQL. Tidak ada plaintext yang tersimpan di manapun.
2. **Google OAuth** — Callback URL yang valid:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://unandnewgame-tan.vercel.app/api/auth/callback/google`
3. **Session Guard** — `FirebaseAuthGuard` (legacy) dan `BetterAuthGuard` mengamankan semua route API sensitif dengan memverifikasi token sesi pada setiap request.

---

## Aturan Keamanan Firestore (Legacy Fallback)

Jika Firestore masih digunakan sebagai dual-write fallback, pastikan aturan keamanan berikut terpasang di Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'OWNER'];
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
