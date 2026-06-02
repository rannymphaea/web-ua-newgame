# Keamanan Platform NEWGAME V2

Dokumen ini menjelaskan rancangan sistem keamanan berlapis pada **NEWGAME V2**, mencakup pertahanan jaringan, kontrol autentikasi, mitigasi brute force, dan keamanan integritas data relasional.

---

## Gambaran Arsitektur Keamanan Berlapis

NEWGAME V2 menerapkan strategi **Defense in Depth** — setiap lapisan didesain agar kegagalan satu lapisan tidak membuka akses ke lapisan berikutnya.

```
                Internet
                    |
         Lapisan 1: WAF dan NGINX
   (OWASP CRS v4, TLS 1.3, CSP, HSTS)
                    |
     Lapisan 2: Rate Limiting dan Proteksi
   (Upstash Redis Guard, In-Memory Limiter)
                    |
     Lapisan 3: Autentikasi dan Otorisasi
      (Better Auth, NestJS RolesGuard)
                    |
      Lapisan 4: Keamanan Basis Data
  (Prisma Parameterized Queries, Encryption)
```

---

## Rate Limiting (Upstash Redis Guard)

Pencegahan serangan brute force dan penyalahgunaan endpoint API ditangani di tingkat aplikasi menggunakan `RateLimitGuard`.

| Endpoint | Batas Request | Jendela Waktu | Respons jika Terlampaui |
|---|---|---|---|
| `/api/auth/*` | 10 request | per 1 menit per IP | HTTP `429 Too Many Requests` |
| `/api/*` (umum) | 100 request | per 1 menit per IP/Token | HTTP `429 Too Many Requests` |

Counter request disimpan di Upstash Redis secara terdistribusi, sehingga tahan terhadap serangan yang memanfaatkan banyak proses server sekaligus.

---

## Autentikasi Mandiri (Better Auth)

Migrasi ke Better Auth meningkatkan keamanan manajemen pengguna secara signifikan dibandingkan Firebase Auth:

**Session Rotation**
Setiap kali pengguna masuk atau melakukan perubahan penting, token sesi (Session ID) dirotasi untuk mencegah eksploitasi Session Fixation Attack.

**Perlindungan CSRF dan XSS**
- CSRF: Dilindungi melalui mekanisme validasi double-submit cookie bawaan Better Auth.
- XSS: Input pengguna disanitasi menggunakan `DOMPurify` di sisi client dan disaring via NestJS `ValidationPipe` (`class-validator`) di sisi server.

**Penyimpanan Password**
Kata sandi di-hash menggunakan algoritma **bcrypt** dengan work factor 10 sebelum tersimpan di PostgreSQL. Tidak ada password yang disimpan dalam bentuk plaintext atau enkripsi reversibel.

**Google OAuth**
State parameter divalidasi ketat pada setiap callback untuk memitigasi serangan OAuth Replay.

---

## Keamanan Data Relasional (Prisma PostgreSQL)

**Pencegahan SQL Injection**
Prisma ORM secara otomatis memparameterisasi semua query SQL. Input pengguna tidak pernah digabungkan langsung sebagai string mentah ke dalam query, sehingga celah SQL Injection dimitigasi secara absolut di tingkat arsitektur.

**Fault Tolerance Database**
`PrismaService` memuat penanganan toleransi kegagalan yang mendeteksi apabila server PostgreSQL offline, kemudian memberikan respons fallback yang aman tanpa membocorkan stack trace database ke pengguna umum.

**Graceful Disconnect**
NestJS mendaftarkan hook siklus hidup (`beforeApplicationShutdown`) untuk memutus koneksi PostgreSQL secara bersih ketika server dimatikan, mencegah kebocoran resource koneksi.

---

## Keamanan Konfigurasi dan Kredensial

> [!CAUTION]
> Jangan pernah melakukan `console.log` terhadap variabel yang berisi API key, token, atau password. Gunakan pengecekan panjang karakter sebagai gantinya.

Contoh pengecekan yang aman:
```typescript
// SALAH — membocorkan nilai kunci ke log produksi
console.log('GROQ KEY:', process.env.GROQ_API_KEY);

// BENAR — hanya mengecek keberadaan dan panjang
this.logger.log(`GROQ_API_KEY loaded: ${process.env.GROQ_API_KEY?.length ?? 0} chars`);
```

Semua nilai sensitif disimpan di file `.env` yang masuk dalam daftar `.gitignore` dan tidak pernah di-commit ke repositori.

---

## Aturan Keamanan Firestore (Legacy Fallback)

Jika Firestore masih digunakan, pastikan aturan berikut terpasang di Firebase Console:

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

---

## Melaporkan Kerentanan Keamanan

> [!IMPORTANT]
> Jika Anda menemukan celah keamanan atau bug sensitif, **jangan membuat public issue di GitHub**. Laporkan secara pribadi agar tidak dieksploitasi sebelum diperbaiki.

Kirimkan laporan lengkap beserta langkah reproduksi (Proof of Concept) melalui email ke:

**unandnewgame@gmail.com**

Tim kami berkomitmen merespons dan memperbaiki setiap laporan kerentanan dalam waktu kurang dari **24 jam**.
