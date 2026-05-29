# NEWGAME Security Blueprint

Dokumen ini menjelaskan arsitektur keamanan, aturan Firestore, panduan pengerasan sistem, integrasi threat intelligence, serta prosedur respons insiden untuk platform NEWGAME.

---

## Arsitektur Keamanan

Sistem keamanan NEWGAME dirancang dengan pertahanan berlapis (defense in depth) yang mencakup beberapa tingkatan:

```
Internet
   |
   v
[ModSecurity WAF + OWASP CRS v4]
   |  JA3 fingerprint | HTTP fingerprint | Auto-ban | Honeypot traps
   v
[NGINX — TLS 1.3 Only]
   |  JSON forensic logs | Geo-IP/ASN | Rate limiting | Request-ID
   v
[NestJS API — Port 3001]
   |  ForensicMiddleware -> ForensicLoggerMiddleware
   |  FirebaseAuthGuard -> RolesGuard -> RequestReplayGuard
   v
[AnomalyEngineService — Isolation Forest AI]
   |  Real-time scoring | Auto-block | Challenge | Alert
   v
[EvidenceChainService — Tamper-Evident Logs]
   |  Hash chain | Merkle tree | Legal export
   v
[SIEM: ELK / Loki / Splunk / Wazuh]
   |  Real-time push | Batch flush | CEF format
   v
[Alerts: Telegram / Discord / Slack / Email]
```

---

## Modul 1 — Firewall Forensik (WAF)

Sistem menggunakan ModSecurity v3 dengan OWASP CRS v4 (Paranoia Level 2) untuk menyaring lalu lintas berbahaya sebelum mencapai aplikasi backend.

### Parameter Firewall
- Mesin: ModSecurity v3
- Aturan: OWASP CRS v4 (Paranoia Level 2)
- Audit Log: Format JSON, bagian ABCDEFHIJKZ
- Timestamp: RFC3339
- Reputasi IP: Skor persisten per IP, pemblokiran otomatis (auto-ban) jika skor melebihi 10.
- JA3 Logging: Melalui header `X-JA3-Fingerprint` yang dikirim dari modul NGINX.
- HTTP Fingerprint: Pola User-Agent, urutan header Accept, dan metadata TLS.
- Honeypot: Lebih dari 15 path rahasia yang memicu penambahan skor ancaman sebesar +5 secara instan jika diakses.
- Geo-IP: Integrasi database MaxMind GeoLite2-City dan GeoLite2-ASN.

---

## Modul 2 — Pengerasan NGINX

Konfigurasi server web NGINX diatur secara ketat untuk meminimalkan permukaan serangan (attack surface).

### Parameter NGINX
- TLS: Versi 1.3 saja (`ssl_protocols TLSv1.3`)
- Cipher Suites: `TLS_AES_256_GCM_SHA384`, `CHACHA20_POLY1305`, `AES_128_GCM`
- HSTS: 2 tahun, mencakup sub-domain, dan terdaftar di pre-load list
- CSP: strict-origin, tanpa unsafe-eval
- Pembatasan Laju (Rate Limiting): global 60/menit, api 30/menit, auth 10/menit
- Request ID: UUIDv4 yang disisipkan ke setiap permintaan melalui `$request_id`
- Access Log: Format JSON lengkap (IP, Negara, ASN, JA3, method, URI, status, response time)
- Hidden Paths: Pemblokiran otomatis untuk file sensitif seperti .env, .git, .htaccess, skrip SQL, kunci privat, dan file backup.

---

## Modul 3 — Middleware NestJS

Aplikasi backend NestJS menggunakan middleware khusus untuk melacak aktivitas forensik dan mendeteksi anomali.

### ForensicMiddleware
Diterapkan secara global pada semua rute backend. Contoh output log per request (JSON stdout):

```json
{
  "type": "FORENSIC_REQUEST",
  "timestamp": "2026-05-27T04:00:00.000Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "ip": "1.2.3.4",
  "ja3": "769,49195-49199...",
  "url": "/api/users/dashboard",
  "method": "GET",
  "payload_hash": "e3b0c44298fc...",
  "device_signature": "a1b2c3d4...",
  "score": 12,
  "action": "allow",
  "geo_country": "ID",
  "geo_city": "Padang",
  "asn": "AS7713",
  "asn_org": "Telekomunikasi Indonesia",
  "user_agent": "Mozilla/5.0...",
  "status_code": 200,
  "response_time_ms": 45
}
```

### FingerprintService
Sidik jari komposit (composite fingerprint) dihasilkan dari SHA-256 dari data berikut:
- Subnet IP /24
- Informasi browser dan OS (dari User-Agent)
- JA3 hash
- Urutan header Accept
- Bahasa utama (3 bahasa pertama dari Accept-Language)
- Pengodean yang diterima (Accept-Encoding)

### ThreatScoringService
Penghitungan skor ancaman dilakukan berdasarkan faktor-faktor berikut:

| Faktor | Skor Ditambahkan |
|--------|------------------|
| Prefix IP terblokir | +20 |
| Deteksi alat pemindai (scanner) di User-Agent | +15 |
| Akses ke honeypot / path sensitif | +15 |
| Laju request > 120/menit | +20 |
| Laju request > 60/menit | +10 |
| URL dengan entropi tinggi (fuzzing) | +10 |
| Keberagaman rute tinggi dari satu IP | +10 |
| Pola payload mencurigakan | +10 |
| Tanpa User-Agent | +5 |
| Tanpa JA3 fingerprint | +3 |

Skema Aksi:
- Skor >= 80: Blokir otomatis (block)
- Skor 50-79: Tantangan (challenge)
- Skor < 50: Izinkan (allow)

---

## Modul 4 — Mode Forensik NestJS

### ForensicLoggerMiddleware
- **Manipulasi Kueri**: Mendeteksi pola serangan SQL Injection pada parameter kueri URL.
- **Penyalahgunaan API Key**: Menandai kunci API yang digunakan lebih dari 500 kali/jam atau dari lebih dari 5 IP berbeda.
- **Pelacakan Sekuensial**: Mendeteksi pola penjelajahan endpoint yang mencurigakan (directory traversal/scanning).
- **Hashing Unggahan File**: Menghasilkan SHA-256 dari setiap file yang diunggah untuk pencatatan audit.

### RequestReplayGuard
- Memanfaatkan header `X-Request-Nonce` dan `X-Request-Timestamp`.
- Batasan waktu: Toleransi perbedaan waktu (clock skew) maksimal 300 detik.
- Pencegahan duplikasi body hash: Jendela waktu 30 detik per IP.
- Diterapkan dengan dekorator `@UseGuards(RequestReplayGuard)` pada endpoint sensitif.

---

## Modul 5 — Mesin Deteksi Anomali AI

Menggunakan algoritma Isolation Forest untuk mendeteksi anomali perilaku lalu lintas secara real-time.

### Parameter Model
- Algoritma: Isolation Forest (Liu et al. 2008)
- Jumlah Pohon (Trees): 100
- Ukuran Sampel: 256 per pohon
- Vektor Fitur: 8 dimensi (rate, payload, diversity, errors, time, score, UA entropy, params)
- Pelatihan: Online, dilakukan setiap 15 menit menggunakan 2000 sampel terakhir.
- Bootstrap: Menggunakan 200 sampel buatan (synthetic) saat startup.
- Skor > 0.7: Tingkat CRITICAL -> Blokir otomatis.
- Skor > 0.5: Tingkat HIGH -> Tantangan.
- Skor > 0.3: Tingkat MEDIUM -> Catat di log dan pantau.

*Prinsip Utama*: Tidak ada serangan balik (no attack-back). Sistem hanya memblokir secara pasif, mencatat log, dan mengirimkan peringatan (alert). Semua keputusan dapat diaudit.

---

## Modul 6 — Integrasi SIEM dan Peringatan Eksternal

### Transportasi SIEM

| Backend | Transport | Autentikasi |
|---------|-----------|-------------|
| Elasticsearch | HTTPS Bulk API | ApiKey header |
| Grafana Loki | HTTPS push API | Basic auth |
| Splunk HEC | HTTPS | Splunk token |
| Wazuh | REST API | Bearer token |
| Webhook Umum | HTTPS POST | X-API-Key |

### Tingkat Peringatan Saluran

| Saluran | CRITICAL | HIGH | MEDIUM | LOW |
|---------|----------|------|--------|-----|
| Telegram | Ya | Ya | Tidak | Tidak |
| Discord | Ya | Ya | Ya | Tidak |
| Slack | Ya | Ya | Tidak | Tidak |
| Email | Ya | Tidak | Tidak | Tidak |
| Log internal | Ya | Ya | Ya | Ya |

Pembatasan laju peringatan: Maksimal 1 peringatan per IP per 60 detik (untuk tingkat non-CRITICAL).

---

## Modul 7 — Suite Forensik Legal (Evidence Chain)

Untuk memastikan keabsahan bukti secara hukum di Indonesia (sesuai UU ITE No. 11/2008 jo. No. 19/2016 dan PP No. 71/2019), sistem menerapkan mekanisme Hash Chain dan Merkle Tree.

### Rantai Hash (Hash Chain)
Setiap entri log forensik memuat:
- `seq`: Nomor urut monotonik
- `timestamp`: Format RFC3339
- `prev_hash`: SHA-256 dari entri sebelumnya
- `entry_hash`: SHA-256 dari seluruh data entri (kecuali hash itu sendiri)

Rantai akan rusak jika ada entri yang diubah, dan hal ini dapat dideteksi secara instan melalui metode `verify()`.

### Merkle Tree
- Dibuat dari kumpulan `entry_hash` setiap 100 entri log.
- Memungkinkan pembuktian keberadaan entri (inclusion proof) secara stateless tanpa harus membuka seluruh isi log.

---

## Modul 8 — Integrasi Threat Intelligence (TI)

Sistem melakukan kueri secara read-only ke penyedia Threat Intelligence luar untuk menambahkan konteks reputasi pada log forensik.

### 1. AbuseIPDB
- Tujuan: Memeriksa reputasi penyalahgunaan IP.
- Setup: Daftarkan kunci API ke variabel `THREAT_INTEL_ABUSEIPDB_KEY` di `.env`.
- Logika: Menambahkan skor ancaman +10 jika skor kepercayaan penyalahgunaan (abuse confidence score) > 50, dan +20 jika > 90.

### 2. AlienVault OTX
- Tujuan: Memeriksa Indikator Kompromi (IOC) dari komunitas keamanan global.
- Setup: Daftarkan kunci ke `THREAT_INTEL_OTX_KEY` di `.env`.

### 3. GreyNoise
- Tujuan: Membedakan pemindaian massal otomatis (mass scanning noise) dengan serangan terarah (targeted attack).
- Setup: Daftarkan kunci ke `THREAT_INTEL_GREYNOISE_KEY` di `.env`.

### Caching Threat Intelligence
Untuk menghindari kehabisan kuota API (rate limit exhaustion), hasil pencarian TI disimpan di memori/Redis selama 24 jam.

---

## Aturan Keamanan Firestore (Firestore Security Rules)

Aturan berikut wajib diterapkan pada Firestore melalui Firebase Console untuk menjaga keamanan data di tingkat database.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
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

    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Events
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // Attendance
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // Tokens
    match /tokens/{tokenId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // Members
    match /members/{memberId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // News
    match /news/{newsId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // Media
    match /media/{mediaId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // Logs
    match /logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false; // immutable
    }

    // Anomalies
    match /anomalies/{anomalyId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if false;
    }

    // Leave
    match /leave/{leaveId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // XP History
    match /xp_history/{xpId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update, delete: if false; // immutable
    }

    // User Badges
    match /user_badges/{badgeId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // User Pillar Levels
    match /user_pillar_levels/{levelId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // Announcements
    match /announcements/{announcementId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // Profile History
    match /profile_history/{historyId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if false; // immutable
    }

    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Daftar Periksa Keamanan (Security Checklist)

### Sebelum Deployment (Pre-Deployment)
- OS Server diperbarui ke versi stabil terbaru dan fail2ban diaktifkan.
- Hanya port 22 (SSH), 80 (HTTP redirect), dan 443 (HTTPS) yang dibuka di firewall UFW.
- Sertifikat TLS terpasang dengan konfigurasi TLS 1.3 saja.
- NGINX dikonfigurasi dengan `server_tokens off` dan menyertakan header keamanan CSP ketat.
- ModSecurity WAF diaktifkan dengan OWASP CRS v4 Paranoia Level 2.
- File `serviceAccountKey.json` memiliki hak akses terbatas (`chmod 600`) dan tidak dimasukkan ke Git.
- `SecurityModule` di NestJS backend terintegrasi dan dikonfigurasi dengan benar.
- Endpoint sensitif dilindungi dengan `RequestReplayGuard`.

### Pemantauan Rutin (Runtime Monitoring)
- Harian: Tinjau dasbor SIEM untuk anomali tingkat tinggi (HIGH/CRITICAL), periksa peringatan di saluran komunikasi, dan verifikasi integritas rantai hash bukti.
- Mingguan: Perbarui daftar blokir IP berdasarkan feed threat intelligence, tinjau statistik pembatasan laju (rate limit hits).
- Bulanan: Lakukan rotasi kunci API SIEM, perbarui basis data GeoLite2, dan tinjau efektivitas aturan firewall.
- Kuartalan: Lakukan pengujian penetrasi (pentest) mandiri, tinjau aturan keamanan Firestore dan konfigurasi Firebase App Check.

---

## Prosedur Respons Insiden

### 1. Deteksi (0-5 menit)
- Menerima notifikasi peringatan keamanan via Telegram/Discord.
- Identifikasi alamat IP penyerang, jenis serangan, tingkat keparahan, dan tanda sidik jari penyerang.
- Lakukan pengecekan pada SIEM untuk mendapatkan gambaran aktivitas lengkap.

### 2. Penahanan (5-15 menit)
- Masukkan IP penyerang ke file `/etc/modsecurity/bad-ips.txt` untuk pemblokiran otomatis oleh WAF.
- Jika serangan masih berlanjut, blokir di tingkat sistem operasi menggunakan firewall: `ufw deny from <IP>`.
- Jika dicurigai ada kebocoran kredensial akun, cabut (revoke) token Firebase terkait.

### 3. Pengumpulan Bukti (15-30 menit)
- Ekspor log rantai bukti melalui metode `evidenceChainService.exportEvidence()`.
- Simpan bukti Merkle Tree yang relevan.
- Ekspor salinan log akses JSON NGINX dan audit log ModSecurity pada rentang waktu kejadian.
- Lakukan dokumentasi tangkapan layar peringatan keamanan.

### 4. Pelaporan dan Pemulihan
- Kirimkan laporan penyalahgunaan ke kontak abuse ISP penyerang.
- Laporkan insiden ke ID-CERT (id-cert@cert.or.id) jika berdampak luas.
- Identifikasi akar penyebab masalah (root cause) dan terapkan perbaikan sistem atau aturan keamanan yang baru.
