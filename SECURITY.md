# Keamanan NEWGAME V2

Dokumen ini menjelaskan rancangan sistem keamanan platform **NEWGAME V2**, mulai dari lapisan pertahanan jaringan, kontrol akses, mitigasi serangan brute force, hingga keamanan integritas data database relasional.

---

## 🛡️ Gambaran Arsitektur Keamanan Berlapis (Defense in Depth)

Sistem NEWGAME V2 menerapkan pertahanan berlapis untuk menjamin jika satu lapisan terkompromi, lapisan berikutnya tetap mampu meredam dan memitigasi serangan secara efektif.

```
                  Internet
                     │
         🔥 Lapisan 1: WAF & NGINX
   (OWASP CRS v4, TLS 1.3, CSP, HSTS)
                     │
    🚨 Lapisan 2: Rate Limiting & Protection
  (Upstash Redis Guard, In-Memory Rate Limiter)
                     │
    🔑 Lapisan 3: Autentikasi & Otorisasi
     (Better Auth, NestJS RolesGuard)
                     │
     💾 Lapisan 4: Keamanan Basis Data
 (Prisma Parameterized Queries, DB Encryption)
```

---

## 🚦 Caching & Rate Limiting Guard (Upstash Redis)

Pencegahan serangan brute force login dan penyalahgunaan endpoint API (DDoS skala kecil) ditangani di tingkat aplikasi menggunakan `RateLimitGuard` yang terintegrasi dengan Upstash Redis:

- **Auth Endpoints** (`/api/auth/*`): Dibatasi maksimal **10 request per 1 menit** per IP Address.
- **General API Endpoints** (`/api/*`): Dibatasi maksimal **100 request per 1 menit** per User Token / IP Address.
- **Upstash Redis Storage**: Menyimpan counter request secara terdistribusi yang aman dari serangan cluster-scale. Jika kuota terlampaui, Guard otomatis mengembalikan HTTP Status `429 Too Many Requests`.

---

## 🔐 Autentikasi Mandiri Aman (Better Auth & OAuth Security)

Dengan migrasi ke **Better Auth**, keamanan manajemen pengguna meningkat secara signifikan:

1. **Session Rotation**: Setiap kali pengguna masuk atau melakukan perubahan penting, token sesi (Session ID) dirotasi untuk mencegah eksploitasi Session Fixation.
2. **CSRF & XSS Protection**: Better Auth menyertakan perlindungan CSRF bawaan melalui validasi double-submit cookie. Data masukan (input data) disanitasi menggunakan `DOMPurify` pada client-side dan disaring via NestJS `ValidationPipe` (menggunakan `class-validator`) di server-side.
3. **Penyimpanan Password**: Kata sandi di-hash menggunakan algoritma **bcrypt** berkekuatan tinggi (work factor/rounds = 10) langsung di dalam database PostgreSQL, menghindari penyimpanan plaintext atau enkripsi dua arah yang lemah.
4. **Google OAuth Security**: Validasi ketat terhadap state parameter saat login untuk memitigasi serangan OAuth Replay.

---

## 💾 Proteksi Data Relasional (Prisma PostgreSQL Security)

Migrasi ke database PostgreSQL melalui Prisma ORM memberikan keuntungan keamanan data:

- **Pencegahan SQL Injection**: Prisma secara otomatis memparameterisasi (parameterize) semua query SQL. Input dari pengguna tidak pernah digabungkan secara langsung sebagai string mentah (raw query string), sehingga memitigasi celah SQL Injection secara absolut.
- **Graceful Fallback & DB Check**: File `prisma.service.ts` memuat penanganan toleransi kegagalan (fault tolerance) yang mendeteksi jika server PostgreSQL offline dan memberikan respons fallback yang aman, tanpa membocorkan stack trace database ke pengguna umum.
- **Graceful DB Disconnect**: NestJS mendaftarkan hook siklus hidup (`beforeApplicationShutdown`) untuk memutus koneksi database PostgreSQL secara aman ketika server dimatikan, mencegah kebocoran resource port (port resource leak).

---

## 🖼️ Aturan Keamanan Dokumen (Legacy Firestore Security Rules)

Jika Anda masih menggunakan basis data dokumen Firestore sebagai dual-write fallback, pastikan ruleset berikut tetap terpasang pada Firebase Console:

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

## 📞 Melaporkan Kerentanan Keamanan (Vulnerability Reporting)

Keamanan platform NEWGAME adalah prioritas utama kami. Jika Anda menemukan celah keamanan atau bug sensitif, mohon **JANGAN membuat public issue di GitHub**.

Kirimkan laporan rinci beserta langkah eksploitasinya (Proof of Concept) melalui email ke: **unandnewgame@gmail.com**. Kami berkomitmen untuk merespons dan memperbaikinya dalam waktu kurang dari 24 jam.
