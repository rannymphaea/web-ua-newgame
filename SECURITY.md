# Keamanan Platform NEWGAME v0.1.1

Dokumen ini menjelaskan rancangan sistem keamanan berlapis pada NEWGAME v0.1.1, mencakup pertahanan jaringan, kontrol autentikasi, mitigasi brute force, dan keamanan integritas data relasional.

---

### Arsitektur Keamanan Berlapis

NEWGAME v0.1.1 menerapkan strategi Defense in Depth â€” setiap lapisan didesain agar kegagalan satu lapisan tidak membuka akses ke lapisan berikutnya.

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

### Rate Limiting

Pencegahan serangan brute force dan penyalahgunaan endpoint ditangani di tingkat aplikasi menggunakan `RateLimitGuard`.

| Endpoint | Batas Request | Jendela Waktu | Respons jika Terlampaui |
|---|---|---|---|
| `/api/auth/*` | 10 request | per 1 menit per IP | HTTP 429 Too Many Requests |
| `/api/*` umum | 100 request | per 1 menit per IP | HTTP 429 Too Many Requests |

Counter request disimpan di Upstash Redis secara terdistribusi, tahan terhadap serangan multi-proses.

---

### Autentikasi Mandiri (Better Auth)

Session Rotation â€” Setiap kali pengguna masuk atau melakukan perubahan penting, token sesi dirotasi untuk mencegah eksploitasi Session Fixation Attack.

Perlindungan CSRF dan XSS â€” CSRF dilindungi melalui validasi double-submit cookie bawaan Better Auth. Input pengguna disanitasi menggunakan DOMPurify di sisi client dan ValidationPipe di sisi server.

Penyimpanan Password â€” Kata sandi di-hash menggunakan bcrypt dengan work factor 10 sebelum tersimpan di PostgreSQL. Tidak ada password yang disimpan dalam bentuk plaintext.

Google OAuth â€” State parameter divalidasi ketat pada setiap callback untuk memitigasi serangan OAuth Replay.

---

### Keamanan Data Relasional (Prisma PostgreSQL)

Pencegahan SQL Injection â€” Prisma ORM secara otomatis memparameterisasi semua query SQL. Input pengguna tidak pernah digabungkan langsung sebagai string mentah ke dalam query.

Fault Tolerance Database â€” PrismaService memuat penanganan toleransi kegagalan yang mendeteksi apabila server PostgreSQL offline, kemudian memberikan respons fallback yang aman tanpa membocorkan stack trace.

Graceful Disconnect â€” NestJS mendaftarkan hook siklus hidup untuk memutus koneksi PostgreSQL secara bersih ketika server dimatikan.

---

### Keamanan Konfigurasi dan Kredensial

> [!CAUTION]
> Jangan pernah melakukan console.log terhadap variabel yang berisi API key, token, atau password.

Contoh pengecekan yang aman:
```typescript
// Salah â€” membocorkan nilai kunci ke log produksi
console.log('GROQ KEY:', process.env.GROQ_API_KEY);

// Benar â€” hanya mengecek keberadaan dan panjang
this.logger.log(`GROQ_API_KEY loaded: ${process.env.GROQ_API_KEY?.length ?? 0} chars`);
```

Semua nilai sensitif disimpan di file `.env` yang masuk dalam daftar `.gitignore` dan tidak pernah di-commit ke repositori.

---

### Aturan Keamanan Firestore (Legacy Fallback)

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

### Melaporkan Kerentanan Keamanan

> [!IMPORTANT]
> Jika Anda menemukan celah keamanan atau bug sensitif, jangan membuat public issue di GitHub. Laporkan secara pribadi agar tidak dieksploitasi sebelum diperbaiki.

Kirimkan laporan lengkap beserta langkah reproduksi ke:

unandnewgame@gmail.com

Tim berkomitmen merespons dan memperbaiki setiap laporan dalam waktu kurang dari 24 jam.
