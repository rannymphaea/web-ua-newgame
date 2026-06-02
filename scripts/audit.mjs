#!/usr/bin/env node
/**
 * NEWGAME — Audit Script (B1)
 * Jalankan: node scripts/audit.mjs
 * 
 * Cek:
 *   - File yang masih pakai Firebase langsung (frontend)
 *   - <img> HTML tag yang belum pakai next/image
 *   - console.log yang belum dihapus (non-test files)
 *   - TODO/FIXME comments
 *   - any type di TypeScript
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT     = process.cwd();
const WEB_SRC  = join(ROOT, 'apps/web/src');
const API_SRC  = join(ROOT, 'apps/api/src');

const results = {
  firebaseDirectImports: [],
  htmlImgTags: [],
  consoleLogs: [],
  todoComments: [],
  anyTypes: [],
};

const EXTS = ['.ts', '.tsx', '.js', '.jsx'];

function walkDir(dir) {
  let files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files = files.concat(walkDir(full));
    } else if (EXTS.includes(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function checkFile(filePath) {
  const rel     = filePath.replace(ROOT + '\\', '').replace(ROOT + '/', '');
  const content = readFileSync(filePath, 'utf-8');
  const lines   = content.split('\n');

  lines.forEach((line, i) => {
    const ln = i + 1;

    // Firebase direct imports
    if (/from ['"]firebase\//.test(line) || /from ['"]firebase-admin/.test(line)) {
      results.firebaseDirectImports.push({ file: rel, line: ln, text: line.trim() });
    }

    // HTML <img> tags (not next/image)
    if (/<img\s/.test(line) && !/\/\// .test(line.trim().slice(0,2))) {
      results.htmlImgTags.push({ file: rel, line: ln, text: line.trim() });
    }

    // console.log (non-test files)
    if (!filePath.includes('.test.') && !filePath.includes('.spec.')) {
      if (/console\.log\(/.test(line)) {
        results.consoleLogs.push({ file: rel, line: ln, text: line.trim() });
      }
    }

    // TODO / FIXME comments
    if (/\/\/\s*(TODO|FIXME|HACK|XXX)/.test(line)) {
      const match = line.match(/(TODO|FIXME|HACK|XXX)[:\s].*/);
      results.todoComments.push({ file: rel, line: ln, text: match ? match[0].trim() : line.trim() });
    }

    // TypeScript any type (explicit, non-comment)
    if (/:\s*any\b/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      results.anyTypes.push({ file: rel, line: ln, text: line.trim() });
    }
  });
}

// Run audit
console.log('\n🔍 NEWGAME Codebase Audit\n' + '='.repeat(50));

const webFiles = walkDir(WEB_SRC);
const apiFiles = walkDir(API_SRC);
[...webFiles, ...apiFiles].forEach(checkFile);

// Report
const sections = [
  { key: 'firebaseDirectImports', icon: '🔥', label: 'Firebase Direct Imports (kandidat migrasi)' },
  { key: 'htmlImgTags',           icon: '🖼️',  label: '<img> HTML tags (ganti ke next/image)' },
  { key: 'consoleLogs',           icon: '📢', label: 'console.log yang tersisa' },
  { key: 'todoComments',          icon: '📌', label: 'TODO/FIXME comments' },
  { key: 'anyTypes',              icon: '⚠️',  label: 'TypeScript any types (explicit)' },
];

let totalIssues = 0;
for (const s of sections) {
  const items = results[s.key];
  totalIssues += items.length;
  console.log(`\n${s.icon} ${s.label} (${items.length})`);
  if (items.length === 0) {
    console.log('   ✅ Clean');
  } else {
    items.slice(0, 10).forEach(i => console.log(`   ${i.file}:${i.line}  → ${i.text.slice(0, 80)}`));
    if (items.length > 10) console.log(`   ... dan ${items.length - 10} lainnya`);
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Total issues: ${totalIssues}`);
console.log('Jalankan ulang setelah perbaikan untuk melihat progres.\n');
