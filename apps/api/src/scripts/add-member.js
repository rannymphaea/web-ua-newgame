/**
 * NEWGAME — Add Single Member Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Tambah 1 anggota baru ke Firestore + generate + hash tempPassword
 * + upload credentials updated ke Cloudinary.
 *
 * Usage:
 *   node apps/api/src/scripts/add-member.js
 *
 * Atau dengan argumen langsung (non-interactive):
 *   node apps/api/src/scripts/add-member.js \
 *     --id "NG21070126PG" \
 *     --name "Nama Lengkap" \
 *     --pillar "Game Logic" \
 *     --gen "GEN 2" \
 *     --no 126 \
 *     --team "Training" \
 *     --status "ACTIVE"
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const admin      = require('firebase-admin');
const bcrypt     = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const readline   = require('readline');

// ── Firebase ──────────────────────────────────────────────────────────────────
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (keyPath) {
  const resolved = require('path').resolve(process.cwd(), keyPath);
  admin.initializeApp({ credential: admin.credential.cert(require(resolved)) });
} else {
  admin.initializeApp({ projectId: 'qr-absensi-unandnewgame' });
}
const db = admin.firestore();

// ── Cloudinary ────────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateTempPassword(memberId, no) {
  const suffix   = memberId.slice(-5).toLowerCase();
  const noPadded = String(no).padStart(3, '0');
  return `ng${noPadded}${suffix}`;
}

async function uploadToCloudinary(content, filename) {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(content, 'utf8');
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder:        'newgame-admin/credentials',
        public_id:     filename,
        access_mode:   'authenticated',
        overwrite:     true,
        tags:          ['credentials', 'admin-only'],
      },
      (err, result) => err ? reject(err) : resolve(result),
    );
    const { Readable } = require('stream');
    Readable.from(buffer).pipe(stream);
  });
}

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// ── Parse CLI args ────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const map  = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--')) map[args[i].slice(2)] = args[i + 1];
  }
  return map;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs();
  let data   = {};

  const PILLARS  = ['Game Logic', 'Game Design', 'Game Sound'];
  const STATUSES = ['ACTIVE', 'AFK', 'NPC', 'RESIGN', 'GLORY'];

  if (args.id) {
    // Non-interactive mode
    data = {
      id:     args.id,
      name:   args.name,
      pillar: args.pillar,
      gen:    args.gen    || 'GEN 2',
      no:     Number(args.no),
      team:   args.team   || '',
      status: (args.status || 'ACTIVE').toUpperCase(),
    };
  } else {
    // Interactive mode
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\n── NEWGAME Add Member ─────────────────────────────\n');

    data.id     = (await ask(rl, '  Member ID  (contoh: NG21070126PG) : ')).trim().toUpperCase();
    data.name   = (await ask(rl, '  Nama Lengkap                      : ')).trim();
    data.no     = Number((await ask(rl, '  Nomor urut (contoh: 126)          : ')).trim());
    data.gen    = (await ask(rl, '  Generasi   (GEN 1 / GEN 2)        : ')).trim() || 'GEN 2';

    console.log(`  Pillar: ${PILLARS.map((p, i) => `[${i+1}] ${p}`).join('  ')}`);
    const pi    = Number(await ask(rl, '  Pilih pillar [1-3]                : ')) - 1;
    data.pillar = PILLARS[pi] || 'Game Logic';

    data.team   = (await ask(rl, '  Team (kosong jika belum)          : ')).trim();

    console.log(`  Status: ${STATUSES.map((s, i) => `[${i+1}] ${s}`).join('  ')}`);
    const si    = Number(await ask(rl, '  Pilih status [1-5] (default: 1)   : ')) - 1;
    data.status = STATUSES[si] || 'ACTIVE';

    rl.close();
    console.log('');
  }

  // Validasi
  if (!data.id || !data.name || !data.no) {
    console.error('❌ id, name, dan no wajib diisi.');
    process.exit(1);
  }

  // Cek apakah sudah ada
  const existing = await db.collection('members').doc(data.id).get();
  if (existing.exists) {
    console.error(`❌ Member ID "${data.id}" sudah ada di Firestore.`);
    process.exit(1);
  }

  // Generate & hash
  const plain    = generateTempPassword(data.id, data.no);
  const hashedPw = await bcrypt.hash(plain, 10);

  console.log(`\n📝 Menambahkan member:`);
  console.log(`   ID      : ${data.id}`);
  console.log(`   Nama    : ${data.name}`);
  console.log(`   Pillar  : ${data.pillar}`);
  console.log(`   Gen     : ${data.gen}`);
  console.log(`   Team    : ${data.team || '-'}`);
  console.log(`   Status  : ${data.status}`);
  console.log(`   Kode akses (plain) : ${plain}`);
  console.log(`   Kode akses (hash)  : [bcrypt, disimpan ke Firestore]\n`);

  // Write ke Firestore
  await db.collection('members').doc(data.id).set({
    memberId:         data.id,
    name:             data.name,
    pillar:           data.pillar,
    division:         data.pillar,
    generation:       data.gen,
    team:             data.team || '',
    status:           data.status.toLowerCase(),
    memberNo:         data.no,
    xpCache:          0,
    tempPassword:     hashedPw,
    isRegistered:     false,
    registeredUserId: null,
    registeredAt:     null,
    createdAt:        admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('✅ Member berhasil ditambahkan ke Firestore!\n');

  // Upload single-entry credentials ke Cloudinary
  const now     = new Date().toISOString();
  const content = [
    `# Kode Akses Anggota Baru — NEWGAME`,
    `> Generated: ${now}`,
    `> RAHASIA — Kirimkan langsung ke anggota secara personal.`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Member ID | \`${data.id}\` |`,
    `| Nama | ${data.name} |`,
    `| Pillar | ${data.pillar} |`,
    `| Generasi | ${data.gen} |`,
    `| **Kode Akses** | \`${plain}\` |`,
    ``,
    `## Instruksi ke Anggota`,
    `1. Buka https://unandnewgame.vercel.app → tab **Daftar**`,
    `2. Isi form dengan data berikut:`,
    `   - Nama Lengkap  : ${data.name}`,
    `   - Member ID     : ${data.id}`,
    `   - Kode Akses    : ${plain}`,
    `   - Email         : *(email aktif milikmu)*`,
    `   - Password Baru : *(minimal 6 karakter)*`,
    `3. Klik Daftar → verifikasi email → login`,
    ``,
    `> Kode akses hanya bisa dipakai **sekali**.`,
  ].join('\n');

  console.log('📤 Mengupload ke Cloudinary...');
  try {
    const ts     = now.replace(/[:.]/g, '-').slice(0, 19);
    const result = await uploadToCloudinary(content, `new-member-${data.id}-${ts}`);
    console.log(`✅ Cloudinary upload berhasil!`);
    console.log(`   URL (signed): ${result.secure_url}`);
    console.log(`   Public ID  : ${result.public_id}`);
    console.log(`   Akses      : authenticated (private)\n`);
  } catch (err) {
    console.error('⚠️  Cloudinary upload gagal:', err.message);
  }

  console.log(`\n📋 Ringkasan untuk dikirim ke ${data.name}:`);
  console.log('─'.repeat(40));
  console.log(`  Member ID  : ${data.id}`);
  console.log(`  Kode Akses : ${plain}`);
  console.log(`  Portal     : https://unandnewgame.vercel.app`);
  console.log('─'.repeat(40));
  console.log('  Kirim info di atas secara personal (DM/langsung).\n');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
