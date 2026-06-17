# MANUAL TASKS — NEWGAME Platform

Catatan tugas yang tidak bisa diotomasi sepenuhnya.
Terakhir diperbarui: 2026-06-17

---

## ✅ SELESAI

### [✅] Seed data anggota ke PostgreSQL via Prisma
- 124 anggota sudah di-seed ke Neon (GEN1: 82, GEN2: 42)
- Kredensial sudah digenerate dengan format: `ngNNNxxxxxpillar`
- Kirim via WhatsApp personal per anggota

### [✅] Fase 1 — Better Auth (pengganti Firebase Auth) — SELESAI
**Apa yang berubah:**
- `apps/api/src/auth/better-auth.config.ts` → instance lengkap dengan Google OAuth + @better-auth/infra dashboard
- `apps/api/src/auth/better-auth.controller.ts` → NestJS handler untuk semua `/api/auth/*`
- `apps/api/src/auth/better-auth.module.ts` → module yang di-register ke AppModule
- `apps/api/src/common/guards/better-auth.guard.ts` → pengganti FirebaseAuthGuard
- `apps/api/src/modules/auth/auth.service.ts` → full rewrite ke Prisma (tanpa Firestore)
- `apps/api/src/modules/auth/auth.controller.ts` → ganti FirebaseAuthGuard → BetterAuthGuard
- `apps/web/src/lib/auth-client.ts` → Better Auth client untuk web
- `apps/web/src/lib/auth-store.ts` → ganti Firebase onAuthStateChanged → Better Auth session
- `apps/web/src/app/login/page.tsx` → ganti semua Firebase calls → Better Auth

**Alur login baru:**
```
Login via Email:
  authClient.signIn.email({ email, password }) → cookie session → dashboard

Login via Member ID:
  1. POST /api/auth/lookup-id → resolve Member ID ke email
  2. authClient.signIn.email({ email: resolved, password })

Login via Google:
  authClient.signIn.social({ provider: 'google' }) → OAuth callback

Register:
  1. POST /api/auth/verify-member → validasi Member ID + kode akses
  2. authClient.signUp.email({ email, password, name })
  3. POST /api/auth/link-member → hubungkan Better Auth user ke Member table
```

**Routes Better Auth aktif:**
- `POST /api/auth/sign-up/email` — register
- `POST /api/auth/sign-in/email` — login email
- `POST /api/auth/sign-out` — logout
- `GET  /api/auth/session` — cek session
- `GET  /api/auth/callback/google` — OAuth Google callback
- `GET  /api/auth/dashboard` — @better-auth/infra dashboard

**Routes custom NEWGAME:**
- `POST /api/auth/verify-member` — validasi Member ID + kode akses (public)
- `POST /api/auth/lookup-id` — resolve Member ID → email (public)
- `POST /api/auth/link-member` — link akun ke Member (auth required)
- `GET  /api/auth/me` — profil lengkap dari PostgreSQL

---

## 🔴 WAJIB SEBELUM GO-LIVE

### [!] Isi Google OAuth credentials
1. Buka: https://console.cloud.google.com/apis/credentials
2. Buat OAuth 2.0 Client ID (Web Application)
3. Authorized redirect URI: `https://api.unandnewgame.vercel.app/api/auth/callback/google`
4. Isi di `apps/api/.env`:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   ```
5. Tambah di Vercel Environment Variables (API project)

### [!] Set BETTER_AUTH_SECRET di production
```
# Generate secret baru (di terminal):
openssl rand -hex 32
# Atau pakai: https://generate-secret.vercel.app/32

# Tambah di Vercel env (API project):
BETTER_AUTH_SECRET=<hasil generate>
BETTER_AUTH_URL=https://api.unandnewgame.vercel.app
```

### [!] Set BETTER_AUTH_URL di web app
```
# Di apps/web/.env.local (dev):
NEXT_PUBLIC_API_URL=http://localhost:3001

# Di Vercel env (Web project):
NEXT_PUBLIC_API_URL=https://api.unandnewgame.vercel.app
```

### [!] Jalankan Prisma migration di database production
Setiap kali skema berubah, jalankan:
```bash
cd apps/api
# Ke Neon (production):
DATABASE_URL="neon-connection-string" npx prisma db push

# Untuk development local:
DIRECT_URL="postgresql://postgres:220807@localhost:5432/newgame" npx prisma db push
```

### [!] Distribusi kredensial anggota
- URL login baru: `https://unandnewgame-tan.vercel.app/login`
- Tab "Daftar" → isi Member ID + Kode Akses → isi email + password baru
- Tidak perlu verifikasi email (requireEmailVerification: false)

---

## 🟡 FASE 2 — User Data Migration (Belum dimulai)

Migrasi data `users` dari Firestore ke PostgreSQL.

**Target:**
- Script `scripts/migrate-firestore-users.ts` — export semua `users` dari Firestore → upsert ke `User` table Prisma
- Verifikasi data setelah migrasi
- Update `/api/auth/me` sudah pakai PostgreSQL (sudah selesai di Fase 1)

---

## 🟡 FASE 3 — Domain Data Migration (Belum dimulai)

| Prioritas | Service | File |
|-----------|---------|------|
| 1 | users | UsersService → Prisma |
| 2 | attendance | AttendanceService → Prisma |
| 3 | events | EventsService → Prisma |
| 4 | xp_history | XpService → Prisma |
| 5 | news | NewsService → Prisma |
| 6 | badges | BadgesService → Prisma |
| 7 | logs, notifications | LogsService → Prisma |
| 8 | Hapus FirebaseModule | firebase.ts, firebase.service.ts |

---

## REFERENSI

### Database
- **Neon** (production): DATABASE_URL di `apps/api/.env`
- **Prisma Studio** (lihat data): `cd apps/api && npx prisma studio`
- **Push schema**: `cd apps/api && npm run db:push`
- **Seed ulang**: `cd apps/api && npm run db:seed`

### Better Auth Dashboard
- Dev: `http://localhost:3001/api/auth/dashboard`
- Prod: `https://api.unandnewgame.vercel.app/api/auth/dashboard`

### Architecture (current)
```
Web (Next.js)          API (NestJS)            Database
─────────────          ─────────────           ──────────
authClient         →   BetterAuthController  → PostgreSQL (Neon)
                         └─ Better Auth ─────── [users, sessions, accounts]
                   →   AuthController       → PostgreSQL (Neon)
                         ├─ verifyMember ──── [members]
                         ├─ lookupById ───── [members]
                         └─ linkMember ───── [members, users]

                   →   Semua Controller lain → Firestore (SEMENTARA)
                                               → PostgreSQL (setelah Fase 3)
```
