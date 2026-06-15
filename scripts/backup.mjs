#!/usr/bin/env node
/**
 * Database Backup Script — NEWGAME v0.1.5
 *
 * Mengekspor snapshot database PostgreSQL ke file SQL.
 * Format nama: backup-YYYY-MM-DD-HH.sql
 *
 * Usage:
 *   node scripts/backup.mjs
 *
 * Environment:
 *   DATABASE_URL — PostgreSQL connection string (Neon/Supabase/lokal)
 *   Contoh: postgresql://user:pass@host:5432/dbname?sslmode=require
 *
 * Requires: pg_dump (PostgreSQL client tools) installed on the system.
 */

import { execSync, spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { URL } from 'url';

// ── Configuration ───────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR   = resolve(process.cwd(), 'backups');
const now          = new Date();
const pad          = (n) => String(n).padStart(2, '0');
const timestamp    = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}`;
const FILENAME     = `backup-${timestamp}.sql`;
const FILEPATH     = join(BACKUP_DIR, FILENAME);

// ── Validate ────────────────────────────────────────────────
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL tidak ditemukan di environment variables.');
  console.error('   Set: export DATABASE_URL="postgresql://user:pass@host/db"');
  process.exit(1);
}

// ── Parse DATABASE_URL ───────────────────────────────────────
let pgHost, pgPort, pgUser, pgPassword, pgDatabase;
try {
  const parsed   = new URL(DATABASE_URL);
  pgHost         = parsed.hostname;
  pgPort         = parsed.port || '5432';
  pgUser         = decodeURIComponent(parsed.username);
  pgPassword     = decodeURIComponent(parsed.password);
  pgDatabase     = parsed.pathname.replace(/^\//, '');

  if (!pgHost || !pgDatabase) throw new Error('host atau database kosong');
} catch (e) {
  console.error(`❌ Gagal parse DATABASE_URL: ${e.message}`);
  console.error('   Format yang diharapkan: postgresql://user:pass@host:5432/dbname');
  process.exit(1);
}

// ── Create backup directory ─────────────────────────────────
if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Backup directory dibuat: ${BACKUP_DIR}`);
}

// ── Run pg_dump ──────────────────────────────────────────────
console.log(`\n🔄 Memulai backup database...`);
console.log(`   Host    : ${pgHost}:${pgPort}`);
console.log(`   Database: ${pgDatabase}`);
console.log(`   User    : ${pgUser}`);
console.log(`   Output  : ${FILEPATH}\n`);

try {
  // Cek pg_dump tersedia
  const versionCheck = spawnSync('pg_dump', ['--version'], { encoding: 'utf-8' });
  if (versionCheck.error) {
    console.error('❌ pg_dump tidak ditemukan. Install PostgreSQL client tools:');
    console.error('   Ubuntu  : sudo apt install postgresql-client');
    console.error('   macOS   : brew install postgresql');
    console.error('   Windows : choco install postgresql');
    process.exit(1);
  }

  // Jalankan pg_dump dengan parameter individual (lebih reliable dari URL)
  // PGPASSWORD diset via env agar password tidak muncul di argumen process
  const pgDumpArgs = [
    '--host', pgHost,
    '--port', pgPort,
    '--username', pgUser,
    '--dbname', pgDatabase,
    '--no-owner',
    '--no-privileges',
    '--clean',
    '--if-exists',
    '--no-password',       // gunakan PGPASSWORD dari env
  ];

  const result = spawnSync('pg_dump', pgDumpArgs, {
    encoding: 'utf-8',
    maxBuffer: 100 * 1024 * 1024, // 100MB
    timeout: 120_000,             // 2 menit
    env: {
      ...process.env,
      PGPASSWORD: pgPassword,     // inject password via env, aman
      PGSSLMODE: DATABASE_URL.includes('sslmode=require') ? 'require' : 'prefer',
    },
  });

  if (result.status !== 0) {
    const errMsg = result.stderr || result.error?.message || 'unknown error';
    console.error(`❌ Backup gagal:\n${errMsg}`);
    process.exit(1);
  }

  if (!result.stdout || result.stdout.trim() === '') {
    console.error('❌ Backup file kosong. Periksa koneksi dan kredensial DATABASE_URL.');
    process.exit(1);
  }

  // Tulis ke file
  writeFileSync(FILEPATH, result.stdout, 'utf-8');

  const stats  = statSync(FILEPATH);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`✅ Backup berhasil!`);
  console.log(`   File   : ${FILENAME}`);
  console.log(`   Ukuran : ${sizeMB} MB`);
  console.log(`   Path   : ${FILEPATH}`);

} catch (error) {
  console.error(`❌ Backup gagal: ${error.message}`);
  process.exit(1);
}
