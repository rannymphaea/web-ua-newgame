#!/usr/bin/env node
/**
 * Firestore â†’ PostgreSQL Migration Script â€” NEWGAME v0.1.1
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
 *   DATABASE_URL â€” PostgreSQL connection string
 *   FIREBASE_CREDENTIALS_JSON â€” Firebase service account JSON string
 *   (atau) serviceAccountKey.json di root project
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// â”€â”€ Parse CLI args â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const COLLECTION_FILTER = args.includes('--collection')
  ? args[args.indexOf('--collection') + 1]
  : null;

// â”€â”€ Firebase Admin Setup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let admin;
try {
  admin = (await import('firebase-admin')).default;
} catch {
  console.error('âŒ firebase-admin tidak terinstall. Jalankan: npm install firebase-admin');
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

  console.error('âŒ Firebase credentials tidak ditemukan.');
  console.error('   Set FIREBASE_CREDENTIALS_JSON atau letakkan serviceAccountKey.json di root.');
  process.exit(1);
}

// â”€â”€ Prisma Setup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let PrismaClient;
try {
  const prismaModule = await import('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
} catch {
  console.error('âŒ @prisma/client tidak tersedia. Jalankan: cd apps/api && npx prisma generate');
  process.exit(1);
}

// â”€â”€ Initialize â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log(`\nðŸ”„ NEWGAME Firestore â†’ PostgreSQL Migration`);
console.log(`   Mode: ${DRY_RUN ? 'ðŸ” DRY RUN (tidak ada data yang ditulis)' : 'ðŸ’¾ LIVE'}`);
if (COLLECTION_FILTER) console.log(`   Collection: ${COLLECTION_FILTER}`);
console.log('');

const app = initFirebase();
const db = admin.firestore();
const prisma = DRY_RUN ? null : new PrismaClient();

if (prisma) {
  await prisma.$connect();
  console.log('âœ… PostgreSQL terhubung\n');
}

// â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const stats = { users: 0, events: 0, attendance: 0, skipped: 0, errors: 0 };

// â”€â”€ Migrate Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function migrateUsers() {
  if (COLLECTION_FILTER && COLLECTION_FILTER !== 'users') return;
  console.log('ðŸ“‹ Migrasi collection: users');

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
      console.error(`   âŒ User ${doc.id}: ${err.message}`);
      stats.errors++;
    }
  }
  console.log(`   âœ… Users migrated: ${stats.users}\n`);
}

// â”€â”€ Migrate Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function migrateEvents() {
  if (COLLECTION_FILTER && COLLECTION_FILTER !== 'events') return;
  console.log('ðŸ“‹ Migrasi collection: events');

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
      console.error(`   âŒ Event ${doc.id}: ${err.message}`);
      stats.errors++;
    }
  }
  console.log(`   âœ… Events migrated: ${stats.events}\n`);
}

// â”€â”€ Migrate Attendance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function migrateAttendance() {
  if (COLLECTION_FILTER && COLLECTION_FILTER !== 'attendance') return;
  console.log('ðŸ“‹ Migrasi collection: attendance');

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
      console.error(`   âŒ Attendance ${doc.id}: ${err.message}`);
      stats.errors++;
    }
  }
  console.log(`   âœ… Attendance migrated: ${stats.attendance}\n`);
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Execute â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
try {
  await migrateUsers();
  await migrateEvents();
  await migrateAttendance();

  console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
  console.log(`ðŸ“Š Migration Summary`);
  console.log(`   Users:      ${stats.users}`);
  console.log(`   Events:     ${stats.events}`);
  console.log(`   Attendance: ${stats.attendance}`);
  console.log(`   Skipped:    ${stats.skipped}`);
  console.log(`   Errors:     ${stats.errors}`);
  console.log(`   Mode:       ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

  if (DRY_RUN) {
    console.log('â„¹ï¸  Jalankan tanpa --dry-run untuk melakukan migrasi aktual.');
  } else {
    console.log(`âœ… Migrated ${stats.users} users, ${stats.events} events, ${stats.attendance} attendance records`);
  }
} catch (err) {
  console.error(`\nâŒ Migration failed: ${err.message}`);
  process.exit(1);
} finally {
  if (prisma) await prisma.$disconnect();
}
