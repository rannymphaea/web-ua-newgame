# Firestore Security Rules — NEWGAME Platform

Dokumen ini menjelaskan aturan akses Firestore yang harus diterapkan di Firebase Console.

---

## Cara Menerapkan

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project NEWGAME
3. Navigasi ke **Firestore Database → Rules**
4. Copy-paste rules di bawah ini
5. Klik **Publish**

---

## Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ═══ HELPER FUNCTIONS ═══
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

    // ═══ USERS ═══
    // Admin: read/write semua
    // User: read semua, write hanya profil sendiri
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // ═══ EVENTS ═══
    // Admin: full CRUD
    // User: read only
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // ═══ ATTENDANCE ═══
    // Admin: full access
    // User: read own, create own (via API saja)
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // ═══ TOKENS (QR) ═══
    // Admin: create
    // User: read (untuk validasi scan)
    match /tokens/{tokenId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // ═══ MEMBERS ═══
    // Semua authenticated user bisa baca
    // Admin saja yang bisa ubah
    match /members/{memberId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // ═══ NEWS ═══
    // Semua authenticated user bisa baca
    // Admin saja yang bisa CRUD
    match /news/{newsId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // ═══ MEDIA ═══
    match /media/{mediaId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // ═══ LOGS ═══
    // Admin only
    match /logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated(); // sistem bisa tulis log
      allow update, delete: if false; // log immutable
    }

    // ═══ ANOMALIES ═══
    // Admin only
    match /anomalies/{anomalyId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if false;
    }

    // ═══ LEAVE (IZIN) ═══
    match /leave/{leaveId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // ═══ XP HISTORY ═══
    match /xp_history/{xpId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update, delete: if false; // XP history immutable
    }

    // ═══ USER BADGES ═══
    match /user_badges/{badgeId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin();
      allow delete: if isAdmin();
    }

    // ═══ USER PILLAR LEVELS ═══
    match /user_pillar_levels/{levelId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin();
      allow delete: if isAdmin();
    }

    // ═══ ANNOUNCEMENTS ═══
    match /announcements/{announcementId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // ═══ DEFAULT: DENY ALL ═══
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Ringkasan Akses

| Collection | User Biasa | Admin |
|-----------|-----------|-------|
| users | Read semua, Write sendiri | Full |
| events | Read | Full CRUD |
| attendance | Read, Create (via API) | Full |
| tokens | Read | Full |
| members | Read | Full CRUD |
| news | Read | Full CRUD |
| media | Read | Full CRUD |
| logs | ❌ | Read, Create |
| anomalies | ❌ | Read, Create, Update |
| leave | Read, Create | Full |
| xp_history | Read | Create (immutable) |
| user_badges | Read | Full |
| user_pillar_levels | Read | Full |
| announcements | Read | Full CRUD |
| profile_history | Read own | Create (immutable) |

---

## Catatan Penting

> ⚠️ **XP dan Log bersifat immutable** — tidak bisa diedit/dihapus untuk menjaga integritas data.

> ⚠️ **Default rule adalah DENY ALL** — collection yang tidak terdaftar tidak bisa diakses.

> ⚠️ **Semua write operation utama dilakukan via NestJS API** (bukan langsung dari client). Rules ini adalah lapisan keamanan tambahan.
