/**
 * lib/auth-client.ts — ROOT LEVEL
 * ─────────────────────────────────────────────────────────
 * File ini di-generate oleh `npx auth init`.
 * Auth client yang sebenarnya untuk web app ada di:
 *   apps/web/src/lib/auth-client.ts
 *
 * File ini hanya untuk referensi / tooling dari root.
 * ─────────────────────────────────────────────────────────
 */
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
});
