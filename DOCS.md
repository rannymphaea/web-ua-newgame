# NEWGAME V2 — Auth & Database Architecture Documentation

Dokumen ini mendokumentasikan sistem autentikasi, manajemen pengguna, dan arsitektur database relasional modern terpadu pada platform **NEWGAME V2**.

---

## 🛡️ Matriks Peran & Izin Akses (Role & Permissions)

Platform ini mengadopsi 6 tingkatan role pengguna berbasis struktur organisasi UKM Game Development Universitas Andalas:

| Peran (Role) | Kemampuan Utama | Tingkat Akses |
|---|---|---|
| `OWNER` | Pemilik sistem, kendali penuh infrastruktur dan billing. | Level 5 (Maksimal) |
| `ADMIN` | Pengaturan role user, melihat log forensik, & AI analytics dashboard. | Level 4 |
| `TRAINER` | Manajemen modul belajar, pembuatan event, input absensi manual. | Level 3 |
| `SOLDAT` | Pengurus inti, membuat artikel berita, mengelola media galeri. | Level 2 |
| `ASSOCIATE` | Anggota tingkat lanjut, dapat mengakses modul proyek khusus. | Level 1 |
| `TRAINEE` | Anggota baru/magang. Akses absensi, leaderboard, & riwayat XP. | Level 0 |

---

## 🔀 Standarisasi API & Interceptor

Untuk memastikan keandalan komunikasi data frontend dan backend, semua HTTP Response diproses secara terpusat melalui `ResponseInterceptor` NestJS:

### Struktur Response Sukses (`ApiResponse<T>`)
Semua endpoint REST API yang sukses akan mengembalikan struktur JSON terpadu berikut:
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

### Struktur Response Error (`AllExceptionsFilter`)
Jika terjadi error (misalnya validasi gagal atau unauthorized), global filter akan menyusun error response:
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

---

## 💾 Skema Database Relasional (Prisma PostgreSQL)

Berikut adalah cetak biru model data relasional pada PostgreSQL (`apps/api/prisma/schema.prisma`):

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-client"
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
  
  // Relasi
  profile     UserProfile?
  sessions    Session[]
  activities  Activity[]
  
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

// 2. Profil Detil Anggota (Gamifikasi)
model UserProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  bio         String?
  github      String?
  linkedin    String?
  skills      String[] // Tag keahlian
  exp         Int      @default(0)
  level       Int      @default(1)
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("user_profiles")
}

// 3. Sesi Login (Better Auth)
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

// 4. Modul Berita & Tutorial
model NewsArticle {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  excerpt     String?
  coverUrl    String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("news_articles")
}

// 5. Log Aktivitas & Kehadiran Anggota
model Activity {
  id          String   @id @default(cuid())
  userId      String
  type        String   // 'weekly_study' | 'event' | 'project' | 'competition'
  title       String
  description String?
  expGained   Int      @default(0)
  date        DateTime
  
  user        User     @relation(fields: [userId], references: [id])
  @@map("activities")
}
```

---

## ⚡ Strategi Caching & Rate Limiting (Upstash Redis)

Untuk meminimalkan beban query langsung ke PostgreSQL, NEWGAME V2 menerapkan caching pintar:

```
                  [ API Request ]
                         │
               RateLimitGuard? (100 req/min)
                         │
                 💡 Ada di Redis?
                  /             \
             (Ya)               (Tidak)
             /                     \
   [ Balas Instan ]         [ Query PostgreSQL ]
                                     │
                             Tulis ke Redis Cache
                                     │
                               [ Balas User ]
```

### Konfigurasi Kunci Cache & TTL (Time To Live)
- `leaderboard:all` — Menyimpan data leaderboard global. TTL: **60 detik**.
- `news:published` — Menyimpan daftar artikel berita publik. TTL: **300 detik**.
- `user:{id}:profile` — Profil detil individu. TTL: **60 detik** (otomatis dihapus / di-invalidate jika user melakukan update data).
- `ip:{address}:count` — Counter in-memory rate limiter untuk memitigasi serangan brute force.

---

## 🛡️ Alur Autentikasi (Better Auth Integration)

Modul `Better Auth` di NestJS bertindak sebagai server otentikasi mandiri.

```
[ Frontend Next.js ]                     [ Backend NestJS ]
         │                                      │
   Kirim Kredensial  ─── POST /api/auth/me ───>  │
         │                                      │  Verifikasi & Validasi
         │  <─────── Cookie / Session Token ───  │  Sesi di PostgreSQL
         │                                      │
  Akses Dashboard (Zustand)
```

1. **Email & Password**: Enkripsi password menggunakan `bcrypt` bawaan adapter Prisma Better Auth sebelum ditulis ke PostgreSQL.
2. **Google OAuth**: Integrasi REST API yang secara aman melakukan redirect callback URL ke:
   `http://localhost:3000/api/auth/callback/google` (Development)
   `https://unandnewgame-tan.vercel.app/api/auth/callback/google` (Production)
3. **Guard Sesi**: `FirebaseAuthGuard` (Legacy) dan `BetterAuthGuard` bertugas mengamankan route API sensitif dengan memeriksa token session.
