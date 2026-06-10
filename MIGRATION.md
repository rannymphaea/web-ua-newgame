# MIGRATION.md — Firestore → PostgreSQL

> **NEWGAME V1.1** — Panduan migrasi dari Firebase Firestore ke PostgreSQL (Neon/Supabase)

## Prasyarat

- [ ] PostgreSQL database sudah aktif (Neon atau Supabase)
- [ ] `DATABASE_URL` sudah diset di environment
- [ ] `npx prisma migrate deploy` sudah dijalankan
- [ ] `npx prisma generate` sudah dijalankan
- [ ] Firebase `serviceAccountKey.json` tersedia atau `FIREBASE_CREDENTIALS_JSON` diset

## Langkah Migrasi

### 1. Dry Run (Preview)

```bash
node scripts/migrate-firestore.mjs --dry-run
```

Review output — pastikan semua data terdeteksi dan mapping benar.

### 2. Migrasi per Collection (Opsional)

```bash
node scripts/migrate-firestore.mjs --collection users --dry-run
node scripts/migrate-firestore.mjs --collection events --dry-run
node scripts/migrate-firestore.mjs --collection attendance --dry-run
```

### 3. Jalankan Migrasi Aktual

```bash
node scripts/migrate-firestore.mjs
```

Output yang diharapkan:
```
✅ Migrated X users, Y events, Z attendance records
```

### 4. Verifikasi

```bash
npx prisma studio   # Buka Prisma Studio untuk cek data
```

## Checklist Cutover

- [ ] Semua user aktif sudah ada di PostgreSQL
- [ ] Semua event sudah dimigrasikan
- [ ] Semua data presensi sudah dimigrasikan
- [ ] Data di PostgreSQL sudah diverifikasi via Prisma Studio
- [ ] Dual-write dinonaktifkan di backend
- [ ] Firestore rules diset ke deny all
- [ ] Environment variable `USE_FIRESTORE_FALLBACK` diset `false`
- [ ] Backend services sudah di-switch ke Prisma queries
- [ ] Testing end-to-end selesai di staging
- [ ] Backup PostgreSQL sudah berjalan (lihat `scripts/backup.mjs`)

## Mapping Role

| Firestore (lama) | PostgreSQL (baru) | Keterangan |
|---|---|---|
| `member` | `MEMBER` | Anggota biasa |
| `admin` | `ADMIN` | Administrator |
| `superadmin` | `CODE_COMMANDER` | Wakil ketua |
| `presiden` | `PIXEL_PRESIDEN` | Ketua |
| `npc` | `NPC` | Belum terverifikasi |
| `pengurus` | `MEMBER` | Dimapping ke member |

## Rollback

Jika terjadi masalah setelah cutover:

1. Set `USE_FIRESTORE_FALLBACK=true` di environment
2. Deploy ulang backend
3. Firestore masih memiliki data — tidak ada data yang dihapus oleh migrasi

## Restore dari Backup

```bash
# Restore backup PostgreSQL
psql $DATABASE_URL < backups/backup-YYYY-MM-DD-HH.sql
```

---

> ⚠️ **PENTING**: Jangan hapus data Firestore sampai minimal 30 hari setelah cutover berhasil dan stabil.
