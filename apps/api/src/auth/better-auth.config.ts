/**
 * Better Auth Configuration — NEWGAME V2
 *
 * ⚠️ SETUP WAJIB:
 *   npm install better-auth
 *   Set env: BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   DATABASE_URL harus sudah aktif (PostgreSQL)
 *
 * Digunakan sebagai pengganti Firebase Auth setelah migrasi selesai.
 */

// Conditional require — aman sebelum better-auth terinstall
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let betterAuth: any = null;
let prismaAdapter: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ba = require('better-auth');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pa = require('better-auth/adapters/prisma');
  betterAuth    = ba.betterAuth;
  prismaAdapter = pa.prismaAdapter;
} catch {
  // better-auth belum terinstall — auth config tidak aktif
}

/** Buat instance Better Auth jika semua dependency tersedia */
export function createBetterAuth(prisma: any) {
  if (!betterAuth || !prismaAdapter) {
    console.warn('[BetterAuth] Package belum terinstall — jalankan: npm install better-auth');
    return null;
  }

  if (!process.env.BETTER_AUTH_SECRET) {
    console.warn('[BetterAuth] BETTER_AUTH_SECRET tidak ditemukan di env');
    return null;
  }

  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),

    // ── Email & Password ─────────────────────────────────
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: false, // aktifkan setelah setup email provider
    },

    // ── Social Providers ─────────────────────────────────
    socialProviders: {
      google: {
        clientId:     process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        // Scope: ambil profile + email
        scope: ['openid', 'profile', 'email'],
      },
    },

    // ── Session ───────────────────────────────────────────
    session: {
      expiresIn:  60 * 60 * 24 * 30, // 30 hari
      updateAge:  60 * 60 * 24,       // refresh token setiap hari
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // cache cookie 5 menit
      },
    },

    // ── Security ──────────────────────────────────────────
    rateLimit: {
      window:  900,  // 15 menit
      max:     10,   // max 10 attempt per window (brute force protection)
    },

    // ── Trusted Origins ───────────────────────────────────
    trustedOrigins: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
    ],

    // ── User fields tambahan ─────────────────────────────
    user: {
      additionalFields: {
        role:     { type: 'string', defaultValue: 'TRAINEE' },
        nim:      { type: 'string', required: false },
        angkatan: { type: 'number', required: false },
        pillar:   { type: 'string', required: false },
      },
    },
  });
}

/** Type export untuk middleware guard */
export type BetterAuthInstance = ReturnType<typeof createBetterAuth>;
