/**
 * lib/auth.ts — ROOT LEVEL (re-export dari API config)
 * ─────────────────────────────────────────────────────
 * File ini di-generate oleh `npx auth init` tapi sudah kita ganti.
 * Instance Better Auth yang sebenarnya ada di:
 *   apps/api/src/auth/better-auth.config.ts
 *
 * File ini hanya dipakai jika ada tool/script yang membutuhkan
 * referensi dari root directory.
 * ─────────────────────────────────────────────────────────────
 * JANGAN jalankan `npx auth migrate` — kita pakai Prisma untuk schema.
 * Tabel sudah dibuat via: cd apps/api && npm run db:push
 */

// Re-export dari config utama
export { auth } from '../apps/api/src/auth/better-auth.config';
