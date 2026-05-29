# Keamanan NEWGAME

Dokumen ini menjelaskan bagaimana sistem NEWGAME dirancang dari sisi keamanan, mulai dari lapisan firewall sampai ke aturan database. Ini juga menjadi panduan kalau ada insiden atau perlu audit.

---

## Gambaran arsitektur

Sistem ini pakai pendekatan *defense in depth* — ada beberapa lapis pertahanan, bukan cuma satu. Kalau satu lapis ditembus, lapis berikutnya masih menghalangi.

```
Internet
   ↓
WAF (ModSecurity + OWASP CRS v4)
   ↓
NGINX (TLS 1.3, rate limiting, security headers)
   ↓
NestJS API (FirebaseAuthGuard, RolesGuard, ForensicMiddleware)
   ↓
Firestore (Security Rules per koleksi)
```

Di antara NestJS dan Firestore ada juga sistem deteksi anomali berbasis AI dan pencatatan forensik yang tamper-evident (log tidak bisa dimanipulasi tanpa ketahuan).

---

## WAF dan NGINX

Firewall aplikasi web menggunakan ModSecurity v3 dengan ruleset OWASP CRS v4 di Paranoia Level 2. Setiap request dari internet melewati sini sebelum sampai ke backend.

Beberapa hal yang diawasi WAF:
- JA3 fingerprint dari koneksi TLS (untuk identifikasi klien mencurigakan)
- Skor reputasi per IP — kalau skor ancaman di atas 10, IP otomatis diblokir
- Lebih dari 15 path honeypot tersembunyi — siapa pun yang mengaksesnya langsung dapat +5 skor ancaman
- Geo-IP dan ASN dari database MaxMind GeoLite2

NGINX dikonfigurasi hanya menerima TLS 1.3, HSTS aktif selama 2 tahun, dan CSP yang cukup ketat. Request ID dalam format UUIDv4 disisipkan ke setiap request untuk memudahkan tracing di log.

---

## Sistem skor ancaman

Backend menghitung skor ancaman untuk setiap request berdasarkan beberapa faktor:

| Kondisi | Tambah skor |
|---|---|
| IP dari daftar blokir | +20 |
| User-Agent dikenali sebagai scanner | +15 |
| Akses ke path honeypot | +15 |
| Lebih dari 120 request/menit | +20 |
| Lebih dari 60 request/menit | +10 |
| URL dengan entropi tinggi (indikasi fuzzing) | +10 |
| Banyak route berbeda dari satu IP | +10 |
| Tidak ada User-Agent | +5 |
| Tidak ada JA3 fingerprint | +3 |

Kalau skor di atas 80, request diblokir otomatis. Skor 50-79 mendapat challenge. Di bawah 50 diizinkan masuk.

---

## Deteksi anomali AI

Di belakang layar ada Isolation Forest yang berjalan setiap 15 menit, dilatih dengan 2000 sampel terakhir. Model ini mendeteksi pola lalu lintas yang tidak wajar secara statistik — bukan berdasarkan rule statis, jadi lebih susah dihindari.

Skor anomali di atas 0.7 menyebabkan blokir otomatis. Di atas 0.5 masuk kategori HIGH. Di atas 0.3 dicatat dan dipantau.

Satu prinsip yang dipegang: sistem tidak pernah melakukan serangan balik. Semua keputusan hanya berupa blokir pasif, pencatatan, dan alert — bisa diaudit sepenuhnya.

---

## Log forensik

Setiap request dicatat dalam format JSON dengan field seperti IP, JA3, URL, method, payload hash, skor ancaman, country, ASN, dan response time. Log ini membentuk rantai hash (hash chain) — setiap entri menyimpan hash dari entri sebelumnya, sehingga kalau ada yang mengedit log lama, rantainya langsung rusak dan bisa terdeteksi.

Setiap 100 entri juga dibuatkan Merkle Tree untuk membuktikan keberadaan entri tertentu tanpa harus membuka seluruh log.

---

## Aturan keamanan Firestore

Terapkan rules ini melalui Firebase Console (Firestore > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
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

    match /tokens/{tokenId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    match /members/{memberId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    match /news/{newsId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    match /media/{mediaId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    match /logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }

    match /anomalies/{anomalyId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if false;
    }

    match /leave/{leaveId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    match /xp_history/{xpId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update, delete: if false;
    }

    match /user_badges/{badgeId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    match /user_pillar_levels/{levelId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    match /announcements/{announcementId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    match /profile_history/{historyId} {
      allow read: if isAuthenticated() &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }

    // Tolak semua akses yang tidak tercantum di atas
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Checklist sebelum deployment

Kalau mau deploy ke server sendiri (bukan Vercel), pastikan hal-hal ini sudah dilakukan:

- UFW hanya buka port 22, 80, dan 443
- TLS 1.3 aktif dengan cipher yang kuat
- ModSecurity WAF aktif dengan OWASP CRS v4
- `serviceAccountKey.json` di-chmod 600 dan tidak ada di Git
- Header keamanan NGINX sudah terpasang (CSP, HSTS, X-Frame-Options)
- Endpoint sensitif di backend sudah pakai `RequestReplayGuard`

Pemantauan rutin: setiap hari cek log anomali HIGH/CRITICAL. Setiap minggu perbarui daftar blokir IP dari feed threat intelligence. Setiap bulan rotasi API key dan perbarui database GeoLite2.

---

## Kalau ada insiden

**Menit 0-5:** Cek notifikasi Telegram/Discord. Identifikasi IP, jenis serangan, dan tingkat keparahan.

**Menit 5-15:** Masukkan IP ke `/etc/modsecurity/bad-ips.txt` atau blokir langsung pakai UFW. Kalau ada indikasi token bocor, revoke token Firebase terkait.

**Menit 15-30:** Ekspor log rantai bukti, simpan Merkle Tree, dan screenshot semua alert. Dokumentasi ini penting kalau perlu dilaporkan ke pihak berwenang.

**Setelah insiden:** Kirim laporan abuse ke ISP penyerang. Kalau berdampak luas, laporan bisa dikirim ke ID-CERT di id-cert@cert.or.id. Identifikasi penyebabnya dan perbaiki sistemnya.

---

Untuk melaporkan kerentanan keamanan, kirim email ke **unandnewgame@gmail.com**. Jangan buat GitHub Issue publik untuk masalah keamanan.
