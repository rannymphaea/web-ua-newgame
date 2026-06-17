/**
 * BetterAuthGuard — Pengganti FirebaseAuthGuard
 * ─────────────────────────────────────────────────────────────────────────────
 * Memverifikasi session Better Auth dari cookie atau header Authorization.
 * Jika valid → inject user ke request.user
 * Jika tidak → lempar UnauthorizedException (401)
 *
 * Gunakan @SkipAuth() decorator untuk endpoint publik.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  CanActivate, ExecutionContext, Injectable,
  UnauthorizedException, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../../auth/better-auth.config';

/** Tandai endpoint yang tidak butuh auth */
export const IS_PUBLIC_KEY = 'isPublic';
export const SkipAuth = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Cek apakah route ditandai @SkipAuth()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();

    try {
      // Konversi Node.js headers → format yang dipahami Better Auth
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        throw new UnauthorizedException('Sesi tidak valid atau sudah berakhir');
      }

      // Cek status akun
      if ((session.user as any).status === 'suspended') {
        throw new UnauthorizedException('Akun kamu telah dinonaktifkan. Hubungi admin.');
      }
      if ((session.user as any).isActive === false) {
        throw new UnauthorizedException('Akun kamu belum diaktifkan.');
      }

      // Inject ke request untuk dipakai @CurrentUser()
      req.user    = session.user;
      req.session = session.session;

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Autentikasi gagal');
    }
  }
}
