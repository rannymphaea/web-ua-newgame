/**
 * Better Auth CLIENT — Web App NEWGAME
 * ─────────────────────────────────────────────────────────────────────────────
 * Digunakan di semua komponen React ('use client') untuk:
 *   - Sign in (email, Member ID, Google)
 *   - Sign up (register anggota baru)
 *   - Sign out
 *   - Get session
 *
 * PENTING: baseURL harus menunjuk ke API URL
 *   Dev  : http://localhost:3001
 *   Prod : https://your-api.vercel.app
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
});

// Re-export helpers yang sering dipakai
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
