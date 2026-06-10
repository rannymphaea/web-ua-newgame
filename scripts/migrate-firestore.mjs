#!/usr/bin/env node
/**
 * Firestore → PostgreSQL Migration Script — NEWGAME V1.1
 *
 * Membaca data dari Firestore dan menginsert ke PostgreSQL via Prisma.
 * Upsert-based: aman dijalankan ulang tanpa duplikasi.
 *
 * Usage:
 *   node scripts/migrate-firestore.mjs                # Full migration
 *   node scripts/migrate-firestore.mjs --dry-run      # Preview tanpa write
 *   node scripts/migrate-firestore.mjs --collection users  # Migrasi satu collection
 *
 * Environment:
 *   DATABASE_URL — PostgreSQL connection string
 *   FIREBASE_CREDENTIALS_JSON — Firebase service account JSON string
 *   (atau) serviceAccountKey.json di root project
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Parse CLI args ────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const COLLECTION_FILTER = args.includes('--collection')
  ? args[args.indexOf('--collection') + 1]
  : null;

// ── Firebase Admin Setup ──────────────────────────────────────
let admin;
try {
  admin = (await import('firebase-admin')).default;
} catch {
  console.error('❌ firebase-admin tidak terinstall. Jalankan: npm install firebase-admin');
  process.exit(1);
}

function initFirebase() {
  if (admin.apps.length > 0) return admin.apps[0];

  // Try env var first
  const credJson = process.env.FIREBASE_CREDENTIALS_JSON;
  if (credJson) {
    const serviceAccount = JSON.parse(credJson);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  // Try file
  const paths = [
    resolve(process.cwd(), 'serviceAccountKey.json'),
    resolve(process.cwd(), 'apps/api/serviceAccountKey.json'),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      const serviceAccount = JSON.parse(readFileSync(p, 'utf-8'));
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  console.error('❌ Firebase credentials tidak ditemukan.');
  console.error('   Set FIREBASE_CREDENTIALS_JSON atau letakkan serviceAccountKey.json di root.');
  process.exit(1);
}

// ── Prisma Setup ──────────────────────────────────────────────
let PrismaClient;
try {
  const prismaModule = await import('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
} catch {
  console.error('❌ @prisma/client tidak tersedia. Jalankan: cd apps/api && npx prisma generate');
  process.exit(1);
}

// ── Initialize ────────────────────────────────────────────────
console.log(`\n🔄 NEWGAME Firestore → PostgreSQL Migration`);
console.log(`   Mode: ${DRY_RUN ? '🔍 DRY RUN (tidak ada data yang ditulis)' : '💾 LIVE'}`);
if (COLLECTION_FILTER) console.log(`   Collection: ${COLLECTION_FILTER}`);
console.log('');

const app = initFirebase();
const db = admin.firestore();
const prisma = DRY_RUN ? null : new PrismaClient();

if (prisma) {
  await prisma.$connect();
  console.log('✅ PostgreSQL terhubung\n');
}

// ── Stats ─────────────────────────────────────────────────────
const stats = { users: 0, events: 0, attendance: 0, skipped: 0, errors: 0 };

// ── Migrate Users ─────────────────────────────────────────────
async function migrateUsers() {
  if (COLLECTION_FILTER && COLLECTION_FILTER !== 'users') return;
  console.log('📋 Migrasi collection: users');

  const snapshot = await db.collection('users').get();
  console.log(`   Ditemukan: ${snapshot.size} dokumen`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    try {
      const userData = {
        firebaseUid: doc.id,
        email: data.email || `${doc.id}@placeholder.local`,
        displayName: data.displayName || data.name || null,
        photoUrl: data.photoURL || null,
        role: mapRole(data.role),
        nim: data.nim || null,
        angkatan: data.angkatan || null,
        gender: 'UNSPECIFIED',
        isActive: data.status === 'active',
        lastLoginAt: data.lastLoginAt ? toDate(data.lastLoginAt) : null,
        createdAt: data.createdAt ? toDate(data.createdAt) : new Date(),
      };

      if (DRY_RUN) {
        console.log(`   [DRY] User: ${userData.email} (${userData.role})`);
      } else {
        await prisma.user.upsert({
          where: { firebaseUid: doc.id },
          create: userData,
          update: {
            displayName: userData.displayName,
            role: userData.role,
            isActive: userData.isActive,
            lastLoginAt: userData.lastLoginAt,
          },
        });
      }
      stats.users++;
    } catch (err) {
      console.error(`   ❌ User ${doc.id}: ${err.message}`);
      stats.errors++;
    }
  }
  console.log(`   ✅ Users migrated: ${stats.users}\n`);
}

// ── Migrate Events ────────────────────────────────────────────
async function migrateEvents() {
  if (COLLECTION_FILTER && COLLECTION_FILTER !== 'events') return;
  console.log('📋 Migrasi collection: events');

  const snapshot = await db.collection('events').get();
  console.log(`   Ditemukan: ${snapshot.size} dokumen`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    try {
      const eventData = {
        id: doc.id,
        title: data.name || data.title || 'Untitled Event',
        description: data.description || null,
        type: mapEventType(data.type),
        location: data.location || null,
        startAt: data.startAt ? toDate(data.startAt) : new Date(),
        endAt: data.endAt ? toDate(data.endAt) : null,
        isRequired: data.isRequired || false,
        maxAttendee: data.maxAttendee || null,
        qrCode: data.qrCode || null,
        createdAt: data.createdAt ? toDate(data.createdAt) : new Date(),
      };

      if (DRY_RUN) {
        console.log(`   [DRY] Event: ${eventData.title}`);
      } else {
        await prisma.event.upsert({
          where: { id: doc.id },
          create: eventData,
          update: {
            title: eventData.title,
            description: eventData.description,
          },
        });
      }
      stats.events++;
    } catch (err) {
      console.error(`   ❌ Event ${doc.id}: ${err.message}`);
      stats.errors++;
    }
  }
  console.log(`   ✅ Events migrated: ${stats.events}\n`);
}

// ── Migrate Attendance ────────────────────────────────────────
async function migrateAttendance() {
  if (COLLECTION_FILTER && COLLECTION_FILTER !== 'attendance') return;
  console.log('📋 Migrasi collection: attendance');

  const snapshot = await db.collection('attendance').get();
  console.log(`   Ditemukan: ${snapshot.size} dokumen`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    try {
      // Lookup user by firebaseUid
      const user = DRY_RUN ? null : await prisma.user.findUnique({
        where: { firebaseUid: data.userId },
      });

      if (!DRY_RUN && !user) {
        stats.skipped++;
        continue; // Skip if user not yet migrated
      }

      const attendanceData = {
        userId: DRY_RUN ? 'dry-run' : user.id,
        eventId: data.eventId,
        status: mapAttendanceStatus(data.status),
        note: data.note || null,
        checkedAt: data.attendedAt ? toDate(data.attendedAt) : new Date(),
      };

      if (DRY_RUN) {
        console.log(`   [DRY] Attendance: user=${data.userId}, event=${data.eventId}`);
      } else {
        // Upsert by unique constraint [userId, eventId]
        const existing = await prisma.attendance.findUnique({
          where: {
            userId_eventId: { userId: user.id, eventId: data.eventId },
          },
        });
        if (!existing) {
          await prisma.attendance.create({ data: attendanceData });
        }
      }
      stats.attendance++;
    } catch (err) {
      console.error(`   ❌ Attendance ${doc.id}: ${err.message}`);
      stats.errors++;
    }
  }
  console.log(`   ✅ Attendance migrated: ${stats.attendance}\n`);
}

// ── Helpers ───────────────────────────────────────────────────
function toDate(val) {
  if (!val) return new Date();
  if (val.toDate) return val.toDate(); // Firestore Timestamp
  if (val instanceof Date) return val;
  if (typeof val === 'string') return new Date(val);
  if (typeof val === 'number') return new Date(val);
  return new Date();
}

function mapRole(firestoreRole) {
  const roleMap = {
    'npc':              'NPC',
    'member':           'MEMBER',
    'inventori':        'INVENTORI',
    'admin':            'ADMIN',
    'quest keeper':     'QUEST_KEEPER',
    'gold guardian':    'GOLD_GUARDIAN',
    'code commander':   'CODE_COMMANDER',
    'pixel presiden':   'PIXEL_PRESIDEN',
    // Legacy mappings
    'superadmin':       'CODE_COMMANDER',
    'presiden':         'PIXEL_PRESIDEN',
    'pengurus':         'MEMBER',
  };
  return roleMap[firestoreRole?.toLowerCase()] || 'MEMBER';
}

function mapEventType(type) {
  const typeMap = {
    'weekly':      'WEEKLY_STUDY',
    'mandatory':   'MANDATORY',
    'optional':    'OPTIONAL',
    'competition': 'COMPETITION',
    'internal':    'INTERNAL',
  };
  return typeMap[type?.toLowerCase()] || 'INTERNAL';
}

function mapAttendanceStatus(status) {
  const statusMap = {
    'present': 'PRESENT',
    'late':    'LATE',
    'excused': 'EXCUSED',
    'absent':  'ABSENT',
  };
  return statusMap[status?.toLowerCase()] || 'PRESENT';
}

// ── Execute ───────────────────────────────────────────────────
try {
  await migrateUsers();
  await migrateEvents();
  await migrateAttendance();

  console.log('═══════════════════════════════════════════');
  console.log(`📊 Migration Summary`);
  console.log(`   Users:      ${stats.users}`);
  console.log(`   Events:     ${stats.events}`);
  console.log(`   Attendance: ${stats.attendance}`);
  console.log(`   Skipped:    ${stats.skipped}`);
  console.log(`   Errors:     ${stats.errors}`);
  console.log(`   Mode:       ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════\n');

  if (DRY_RUN) {
    console.log('ℹ️  Jalankan tanpa --dry-run untuk melakukan migrasi aktual.');
  } else {
    console.log(`✅ Migrated ${stats.users} users, ${stats.events} events, ${stats.attendance} attendance records`);
  }
} catch (err) {
  console.error(`\n❌ Migration failed: ${err.message}`);
  process.exit(1);
} finally {
  if (prisma) await prisma.$disconnect();
}
