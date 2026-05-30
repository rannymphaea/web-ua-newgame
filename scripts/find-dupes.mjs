#!/usr/bin/env node
/**
 * NEWGAME — Duplicate Asset Detector
 * G4: Script untuk deteksi file duplikat di seluruh project
 *
 * Usage:
 *   node scripts/find-dupes.mjs
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT   = process.cwd();
const SEARCH = [
  'apps/web/public',
  'assets',
];
const EXT_FILTER = new Set(['.png','.jpg','.jpeg','.webp','.avif','.svg','.mp4','.mp3','.wav']);

function hashFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buf).digest('hex');
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (EXT_FILTER.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

// --- Run ---
const allFiles = SEARCH.flatMap(d => walk(path.join(ROOT, d)));

// Group by filename
const byName = {};
for (const f of allFiles) {
  const name = path.basename(f);
  if (!byName[name]) byName[name] = [];
  byName[name].push(f);
}

// Detect same-name dupes
console.log('\n=== SAME-NAME DUPLICATES ===');
let nameFound = false;
for (const [name, files] of Object.entries(byName)) {
  if (files.length > 1) {
    nameFound = true;
    console.log(`\n⚠️  ${name}`);
    for (const f of files) {
      const size = fs.statSync(f).size;
      console.log(`   ${f.replace(ROOT, '.')} [${(size/1024).toFixed(1)} KB]`);
    }
  }
}
if (!nameFound) console.log('   None found.');

// Detect same-content dupes (by hash)
console.log('\n=== SAME-CONTENT DUPLICATES (by MD5) ===');
const byHash = {};
for (const f of allFiles) {
  try {
    const h = hashFile(f);
    if (!byHash[h]) byHash[h] = [];
    byHash[h].push(f);
  } catch {
    // skip unreadable
  }
}
let hashFound = false;
for (const [, files] of Object.entries(byHash)) {
  if (files.length > 1) {
    hashFound = true;
    console.log('\n⚠️  Identical content:');
    for (const f of files) {
      console.log(`   ${f.replace(ROOT, '.')}`);
    }
  }
}
if (!hashFound) console.log('   None found.\n');
