#!/usr/bin/env node
/**
 * Database Backup Script â€” NEWGAME v0.1.1
 *
 * Mengekspor snapshot database PostgreSQL ke file SQL.
 * Format nama: backup-YYYY-MM-DD-HH.sql
 *
 * Usage:
 *   node scripts/backup.mjs
 *
 * Environment:
 *   DATABASE_URL â€” PostgreSQL connection string (Neon/Supabase)
 *
 * Requires: pg_dump (PostgreSQL client tools) installed on the system.
 * Alternatively, set BACKUP_METHOD=prisma to use Prisma-based export.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';

// â”€â”€ Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR = resolve(process.cwd(), 'backups');
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}`;
const FILENAME = `backup-${timestamp}.sql`;
const FILEPATH = join(BACKUP_DIR, FILENAME);

// â”€â”€ Validate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if (!DATABASE_URL) {
  console.error('âŒ DATABASE_URL tidak ditemukan di environment variables.');
  console.error('   Set: export DATABASE_URL="postgresql://user:pass@host/db"');
  process.exit(1);
}

// â”€â”€ Create backup directory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`ðŸ“ Backup directory dibuat: ${BACKUP_DIR}`);
}

// â”€â”€ Run pg_dump â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log(`\nðŸ”„ Memulai backup database...`);
console.log(`   Timestamp: ${timestamp}`);
console.log(`   Output: ${FILEPATH}\n`);

try {
  // Check if pg_dump is available
  try {
    execSync('pg_dump --version', { stdio: 'pipe' });
  } catch {
    console.error('âŒ pg_dump tidak ditemukan. Install PostgreSQL client tools:');
    console.error('   Windows: choco install postgresql');
    console.error('   macOS:   brew install postgresql');
    console.error('   Ubuntu:  sudo apt install postgresql-client');
    process.exit(1);
  }

  // Run pg_dump
  const output = execSync(
    `pg_dump "${DATABASE_URL}" --no-owner --no-privileges --clean --if-exists`,
    {
      encoding: 'utf-8',
      maxBuffer: 100 * 1024 * 1024, // 100MB max
      timeout: 120000, // 2 minute timeout
    },
  );

  // Write to file
  writeFileSync(FILEPATH, output, 'utf-8');

  // Validate
  const stats = statSync(FILEPATH);
  if (stats.size === 0) {
    console.error('âŒ Backup file kosong. Periksa DATABASE_URL.');
    process.exit(1);
  }

  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`âœ… Backup berhasil!`);
  console.log(`   File: ${FILENAME}`);
  console.log(`   Ukuran: ${sizeMB} MB`);
  console.log(`   Path: ${FILEPATH}`);
} catch (error) {
  console.error(`âŒ Backup gagal: ${error.message}`);
  process.exit(1);
}
