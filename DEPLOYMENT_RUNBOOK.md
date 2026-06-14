# Deployment Runbook — NEWGAME v0.1.5
UKM Game Development, Universitas Andalas

> Dokumen ini menjelaskan langkah-langkah deployment platform NEWGAME ke production.
> Dibaca oleh: DevOps, Code Commander, Pixel Presiden.

---

## 1. Prerequisites

```
Node.js >= 20.x
npm >= 10.x
Git
Vercel CLI (npm i -g vercel)
PostgreSQL client (psql)
```

---

## 2. Environment Variables

### Frontend (apps/web — Vercel)

| Variable | Keterangan | Contoh |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL backend API | `https://api.unandnewgame.vercel.app/api` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | dari Firebase Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `newgame-xxx.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `newgame-xxx` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage | `newgame-xxx.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:xxx:web:xxx` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog API Key | `phc_xxxx` |

### Backend (apps/api — Vercel/Railway/Fly.io)

| Variable | Keterangan |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase Project ID |
| `FIREBASE_CLIENT_EMAIL` | Service Account email |
| `FIREBASE_PRIVATE_KEY` | Service Account private key (include newlines) |
| `DATABASE_URL` | PostgreSQL connection string (Neon/Supabase) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `UPSTASH_REDIS_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis token |
| `OPENAI_API_KEY` | OpenAI API key (untuk AI features) |
| `ZILLIZ_URI` | Zilliz Cloud / Milvus URI |
| `ZILLIZ_TOKEN` | Zilliz Cloud API token |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port (biasanya 587) |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address email |
| `SMTP_SECURE` | `true` jika port 465, `false` lainnya |

---

## 3. Database Setup (PostgreSQL / Neon)

### 3.1 Buat database baru di Neon

1. Buka https://neon.tech → New Project
2. Region: Asia Pacific (Singapore) atau US East
3. Copy connection string ke `DATABASE_URL`

### 3.2 Jalankan Prisma migration

```bash
cd apps/api
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### 3.3 Verifikasi

```bash
DATABASE_URL="postgresql://..." npx prisma db pull
```

---

## 4. Firestore Setup

### 4.1 Firebase Console

1. https://console.firebase.google.com → Project → Build → Firestore Database
2. Start in **production mode**
3. Region: `asia-southeast2` (Jakarta)

### 4.2 Seed member data

```bash
# Di root repo, dengan service account sudah dikonfigurasi:
FIREBASE_PROJECT_ID=xxx FIREBASE_CLIENT_EMAIL=xxx FIREBASE_PRIVATE_KEY=xxx \
  node apps/api/src/scripts/seed-members.js
```

### 4.3 Security Rules

Salin rules dari `apps/api/firestore.rules` ke Firebase Console → Firestore → Rules.

---

## 5. Vercel Deployment

### 5.1 Frontend (apps/web)

```bash
vercel --prod
# Ikuti prompt, pilih project yang sudah ada atau buat baru
```

**vercel.json sudah dikonfigurasi** untuk:
- Build di `apps/web`
- Proxy `/api/*` ke backend URL
- Security headers

### 5.2 Backend (apps/api)

Opsi A — **Vercel Serverless**:
```bash
cd apps/api
vercel --prod
```

Opsi B — **Railway** (recommended untuk NestJS WebSocket):
```bash
railway login
railway init
railway up
```

Opsi C — **Fly.io**:
```bash
fly auth login
fly launch --dockerfile apps/api/Dockerfile
fly deploy
```

> [!IMPORTANT]
> WebSocket (socket.io) membutuhkan server persistent — gunakan Railway atau Fly.io.
> Vercel Serverless tidak mendukung WebSocket yang persisten.

---

## 6. Post-Deployment Checklist

```
[ ] Verifikasi NEXT_PUBLIC_API_URL di Vercel environment menunjuk ke backend yang benar
[ ] Test login: email, Member ID, Google OAuth
[ ] Test QR scan: buka /scan di HP, scan QR event
[ ] Test admin: buka /admin, create event, lihat member
[ ] Verifikasi Cloudinary upload berfungsi (upload foto profil)
[ ] Verifikasi email notification (cek SMTP_HOST)
[ ] Monitor Vercel logs selama 30 menit pertama
```

---

## 7. Rollback

```bash
# Lihat deployment history
vercel ls

# Rollback ke deployment sebelumnya
vercel rollback <deployment-url>
```

---

## 8. Monitoring

| Tool | URL | Keterangan |
|---|---|---|
| Vercel Analytics | vercel.com/dashboard | Deployment + error logs |
| PostHog | app.posthog.com | User analytics + recording |
| Upstash | app.upstash.com | Redis metrics |
| Neon | neon.tech | PostgreSQL metrics |
| Firebase Console | console.firebase.google.com | Firestore reads/writes |

---

## 9. Backup

Otomatis via GitHub Actions (`.github/workflows/backup.yml`):
- **Jadwal**: setiap hari jam 02:00 WIB
- **Simpan ke**: GitHub artifact 30 hari
- **Required secret**: `DATABASE_URL`

Manual:
```bash
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
```

---

*NEWGAME — UKM Game Development, Universitas Andalas*
*Dokumen ini diperbarui: 15 Juni 2026*
