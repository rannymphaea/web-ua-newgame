/**
 * Better Auth CLIENT — Web App NEWGAME
 * ─────────────────────────────────────────────────────────────────────────────
 * Digunakan di semua komponen React ('use client') untuk:
 *   - Sign in (email, Member ID, Google)
 *   - Sign up (register anggota baru)
 *   - Sign out
 *   - Get session
 *
 * PENTING:
 *   baseURL = URL API (tanpa /api/auth suffix)
 *   basePath = path prefix yang dipakai Better Auth server (/api/auth)
 *
 *   Dev  : http://localhost:3001  → auth routes di http://localhost:3001/api/auth/*
 *   Prod : https://unandnewgame.vercel.app → auth routes di .../api/auth/*
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // URL API (bukan web) — JANGAN tambahkan /api/auth di sini
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',

  // Harus sama dengan basePath di server better-auth.config.ts
  basePath: '/api/auth',
});

// Re-export helpers yang sering dipakai
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
