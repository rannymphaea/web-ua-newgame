/**
 * Better Auth Controller — NEWGAME
 * ─────────────────────────────────────────────────────────────────────────────
 * Menangani semua route /api/auth/* dan meneruskannya ke Better Auth handler.
 *
 * Routes yang aktif secara otomatis:
 *   POST   /api/auth/sign-up/email          → register email/password
 *   POST   /api/auth/sign-in/email          → login email/password
 *   POST   /api/auth/sign-out               → logout (hapus session)
 *   GET    /api/auth/session                → cek session aktif
 *   GET    /api/auth/callback/google        → OAuth Google callback
 *   GET    /api/auth/sign-in/social?...     → redirect ke Google
 *   POST   /api/auth/forget-password        → kirim link reset password
 *   POST   /api/auth/reset-password         → ganti password via token
 *   GET    /api/auth/dashboard              → @better-auth/infra dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { All, Controller, Req, Res } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './better-auth.config';

// Konversi Better Auth web handler → Node.js handler untuk NestJS
const handler = toNodeHandler(auth);

@Controller('auth')
export class BetterAuthController {
  /**
   * Tangkap SEMUA method dan semua sub-path di /api/auth/*
   * Lalu teruskan ke Better Auth handler.
   */
  @All('*')
  async handleAuth(@Req() req: any, @Res() res: any) {
    return handler(req, res);
  }
}
