/**
 * Better Auth — NEWGAME Platform v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth layer pengganti Firebase Auth.
 * Mendukung: Email/Password, Google OAuth, Member ID login, Dashboard @better-auth/infra.
 *
 * ENV yang dibutuhkan (apps/api/.env):
 *   BETTER_AUTH_SECRET=<32+ char random string>
 *   BETTER_AUTH_URL=https://your-api-domain.com   # atau http://localhost:3001 di dev
 *   FRONTEND_URL=https://your-frontend.vercel.app # atau http://localhost:3000 di dev
 *   GOOGLE_CLIENT_ID=<dari Google Cloud Console>
 *   GOOGLE_CLIENT_SECRET=<dari Google Cloud Console>
 *   DATABASE_URL=<Neon PostgreSQL connection string>
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

// ── @better-auth/infra: Dashboard plugin ─────────────────────────────────────
let dash: (() => any) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const infraPkg = require('@better-auth/infra');
  dash = infraPkg.dash ?? infraPkg.default?.dash ?? null;
} catch {
  // @better-auth/infra tidak terinstall — dashboard tidak aktif
}

// ── Singleton Prisma client untuk Better Auth ─────────────────────────────────
// Gunakan instance terpisah dari NestJS PrismaService agar tidak konflik lifecycle
const _prismaForAuth = new PrismaClient();

// ── Better Auth Instance ──────────────────────────────────────────────────────
// Export langsung sebagai singleton — dipakai oleh handler dan guard
export const auth = betterAuth({
  database: prismaAdapter(_prismaForAuth, { provider: 'postgresql' }),

  // ── Base URL ─────────────────────────────────────────────────────────────
  // Harus sama dengan URL API kamu agar redirect OAuth benar
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',

  // ── Secret ───────────────────────────────────────────────────────────────
  secret: process.env.BETTER_AUTH_SECRET ?? 'change-me-in-production-32chars!',

  // ── Trusted Origins (CORS) ───────────────────────────────────────────────
  trustedOrigins: [
    process.env.FRONTEND_URL      ?? 'http://localhost:3000',
    process.env.BETTER_AUTH_URL   ?? 'http://localhost:3001',
    'https://unandnewgame-tan.vercel.app',
  ],

  // ── Email & Password ─────────────────────────────────────────────────────
  emailAndPassword: {
    enabled:                  true,
    minPasswordLength:        8,
    maxPasswordLength:        128,
    requireEmailVerification: false, // aktifkan setelah setup email provider (Resend dsb)
    autoSignIn:               true,
  },

  // ── Google OAuth ─────────────────────────────────────────────────────────
  // Redirect URI yang perlu didaftarkan di Google Cloud Console:
  //   {BETTER_AUTH_URL}/api/auth/callback/google
  socialProviders: {
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // ── Session ──────────────────────────────────────────────────────────────
  session: {
    expiresIn:  60 * 60 * 24 * 30,  // 30 hari
    updateAge:  60 * 60 * 24,        // refresh setiap hari
    cookieCache: {
      enabled: true,
      maxAge:  60 * 5,               // cache 5 menit
    },
  },

  // ── Rate Limiting bawaan Better Auth ────────────────────────────────────
  // Ini berlapis dengan ThrottlerGuard NestJS dan Nginx
  rateLimit: {
    window: 900,   // 15 menit
    max:    10,    // 10 attempt per window (brute force protection)
  },

  // ── User: field tambahan NEWGAME ─────────────────────────────────────────
  user: {
    additionalFields: {
      role:           { type: 'string',  defaultValue: 'member',     required: false },
      memberId:       { type: 'string',  required: false },
      pillar:         { type: 'string',  required: false },
      division:       { type: 'string',  required: false },
      xpCache:        { type: 'number',  defaultValue: 0,            required: false },
      level:          { type: 'number',  defaultValue: 1,            required: false },
      streak:         { type: 'number',  defaultValue: 0,            required: false },
      attendanceCount:{ type: 'number',  defaultValue: 0,            required: false },
      status:         { type: 'string',  defaultValue: 'active',     required: false },
      isActive:       { type: 'boolean', defaultValue: true,         required: false },
    },
  },

  // ── Plugins ──────────────────────────────────────────────────────────────
  // @better-auth/infra: dashboard monitoring di /api/auth/dashboard
  plugins: [
    ...(dash ? [dash()] : []),
  ],

  // ── Advanced ─────────────────────────────────────────────────────────────
  advanced: {
    // Cookie config — pastikan secure=true di production
    cookiePrefix:    'newgame',
    useSecureCookies: process.env.NODE_ENV === 'production',
    crossSubdomainCookies: {
      enabled: process.env.NODE_ENV === 'production',
    },
  },
});

// ── Type exports ──────────────────────────────────────────────────────────────
export type Auth    = typeof auth;
export type Session = typeof auth.$Infer.Session;
