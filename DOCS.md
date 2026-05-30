# NEWGAME — Auth & User Management Documentation

> Stack: Next.js 14 · NestJS · Firebase Auth · Firestore  
> Base URL API: `https://<your-domain>/api`

---

## Role & Permission Matrix

| Role | Register Admin | Set Role | Lihat Users | Absensi | Dashboard |
|------|:---:|:---:|:---:|:---:|:---:|
| `superadmin` | ✅ | ✅ (semua) | ✅ | ✅ | ✅ |
| `admin` | ❌ | ✅ (→member only) | ✅ | ✅ | ✅ |
| `member` | ❌ | ❌ | ❌ | ✅ | ✅ (terbatas) |

> Role disimpan di **Firebase Auth Custom Claims** (`{ role: "admin" }`) dan di dokumen **Firestore `users/{uid}.role`**.  
> Guard `RolesGuard` membaca dari token JWT yang sudah di-decode.

---

## Alur 1: Register Member/User

```
[Client]
  1. GET /api/auth/verify-member  ← cek memberId + tempPassword
  2. createUserWithEmailAndPassword (Firebase Auth SDK — client side)
  3. POST /api/auth/register       ← kirim token + data profil
  4. Redirect → /dashboard

[Server]
  verify-member → cek Firestore collection `members`
  register      → buat doc `users/{uid}` + update `members.isRegistered = true`
```

### Payload `POST /api/auth/verify-member`
```json
{
  "memberId": "NGL-2024-001",
  "tempPassword": "abc123"
}
```
**Response 200:**
```json
{
  "valid": true,
  "memberId": "NGL-2024-001",
  "name": "Budi Santoso",
  "division": "gamedev",
  "team": "A",
  "status": "active"
}
```

### Payload `POST /api/auth/register`
> Header: `Authorization: Bearer <firebase-id-token>`
```json
{
  "memberId": "NGL-2024-001",
  "displayName": "Budi Santoso",
  "division": "gamedev",
  "team": "A"
}
```
**Response 200:**
```json
{ "success": true }
```

---

## Alur 2: Register Admin

> ⚠️ Hanya bisa dilakukan oleh **superadmin** yang sudah login.  
> UI tersedia di `/admin/register-admin`.

```
[Superadmin Client]
  1. Login dengan akun superadmin → dapat ID token
  2. Buka /admin/register-admin
  3. Isi form → POST /api/auth/register-admin

[Server]
  - Validasi input (email, password ≥8, displayName ≥2)
  - createUser via Firebase Admin SDK (password di-hash oleh Firebase)
  - setCustomUserClaims(uid, { role: 'admin' })
  - Tulis Firestore doc users/{uid} dengan role: 'admin'
  - Tulis log ke collection `logs`
```

### Endpoint
```
POST /api/auth/register-admin
Authorization: Bearer <superadmin-id-token>
Content-Type: application/json
```

### Payload
```json
{
  "email": "admin@newgame.ac.id",
  "password": "SecurePass123!",
  "displayName": "Reza Admin",
  "division": "general"
}
```

### Response 201
```json
{
  "success": true,
  "uid": "abc123xyz",
  "email": "admin@newgame.ac.id",
  "displayName": "Reza Admin",
  "role": "admin"
}
```

### Error Responses
| Status | Kondisi |
|--------|---------|
| `400` | Email/password/displayName tidak valid |
| `400` | Email sudah terdaftar (`auth/email-already-exists`) |
| `401` | Token tidak valid / expired |
| `403` | Role caller bukan `superadmin` |

---

## Alur 3: Login

```
[Client]
  1. signInWithEmailAndPassword (Firebase Auth SDK)
  2. getIdToken() → kirim ke semua request API sebagai Bearer token
  3. GET /api/auth/me → ambil profil + role dari Firestore

[Server]
  FirebaseAuthGuard → verifyIdToken → inject user ke request
  RolesGuard        → cek user.role dari custom claims
```

### `GET /api/auth/me`
> Header: `Authorization: Bearer <id-token>`

**Response 200:**
```json
{
  "id": "uid123",
  "email": "budi@example.com",
  "displayName": "Budi Santoso",
  "role": "member",
  "division": "gamedev",
  "memberId": "NGL-2024-001",
  "xpCache": 420,
  "attendanceCount": 12,
  "streak": 3,
  "status": "active"
}
```

---

## Alur 4: Set Role (Admin Management)

```
POST /api/auth/set-role
Authorization: Bearer <superadmin-token>
```
```json
{
  "userId": "target-uid-123",
  "role": "admin"
}
```
- `superadmin` → bisa set ke `member | admin | superadmin`
- `admin` → hanya bisa set ke `member`

---

## Validasi Server (auth.service.ts)

| Field | Rule |
|-------|------|
| `email` | Wajib, mengandung `@`, lowercase auto |
| `password` | Minimal 8 karakter |
| `displayName` | Minimal 2 karakter setelah `.trim()` |
| `division` | Opsional, default `"general"` |
| `memberId` | Harus ada di Firestore `members`, belum `isRegistered` |
| `tempPassword` | Harus cocok dengan `members.tempPassword` |

---

## Struktur Firestore

### `users/{uid}`
```ts
{
  email:          string;
  displayName:    string;
  memberId:       string | null;   // null untuk admin
  division:       string;
  team:           string;
  role:           'member' | 'admin' | 'superadmin';
  status:         'active' | 'inactive';
  xpCache:        number;
  attendanceCount:number;
  streak:         number;
  createdAt:      Timestamp;
}
```

### `members/{memberId}`
```ts
{
  memberId:         string;
  name:             string;
  division:         string;
  team:             string;
  status:           'active' | 'inactive';
  tempPassword:     string;       // dibuat admin, diberikan saat orientasi
  isRegistered:     boolean;
  registeredUserId: string | null;
  registeredAt:     Timestamp | null;
}
```

### `logs/{auto-id}`
```ts
{
  userId:    string;
  action:    'register' | 'register-admin' | 'set-role' | ...;
  result:    'success' | 'failed';
  timestamp: Timestamp;
  // + field tambahan sesuai action
}
```

---

## Setup Awal: Buat Superadmin Pertama

> Superadmin pertama HARUS dibuat manual via Firebase Console atau script.

```ts
// scripts/create-superadmin.ts
import * as admin from 'firebase-admin';
admin.initializeApp();

async function createSuperadmin() {
  const user = await admin.auth().createUser({
    email: 'superadmin@newgame.ac.id',
    password: 'GantiIni!Sekarang123',
    displayName: 'Super Admin',
  });

  // Set custom claim
  await admin.auth().setCustomUserClaims(user.uid, { role: 'superadmin' });

  // Tulis Firestore
  await admin.firestore().collection('users').doc(user.uid).set({
    email: 'superadmin@newgame.ac.id',
    displayName: 'Super Admin',
    role: 'superadmin',
    division: 'general',
    status: 'active',
    memberId: null,
    xpCache: 0,
    attendanceCount: 0,
    streak: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('Superadmin created:', user.uid);
}

createSuperadmin();
```

Jalankan:
```bash
cd apps/api
npx ts-node scripts/create-superadmin.ts
```

---

## Frontend Routes

| Path | Role Required | Keterangan |
|------|:---:|------------|
| `/landing` | — | Public landing page |
| `/login` | — | Firebase Auth login |
| `/register` | — | Registrasi member (butuh memberId) |
| `/dashboard` | `member+` | Dashboard utama |
| `/admin/register-admin` | `superadmin` | Buat akun admin baru |
| `/admin/news` | `admin+` | Kelola berita/tutorial |
| `/admin/members` | `admin+` | Kelola data member |

---

## Quick Reference API

```
POST /api/auth/verify-member      → Cek memberId + tempPassword
POST /api/auth/register           → Buat profil member (butuh Firebase token)
GET  /api/auth/me                 → Profil user login
POST /api/auth/set-role           → Ubah role user (admin/superadmin)
GET  /api/auth/users              → List semua user (superadmin)
POST /api/auth/register-admin     → Buat akun admin baru (superadmin)
```
