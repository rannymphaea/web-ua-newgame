import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';

/**
 * AuthModule — modul untuk alur registrasi NEWGAME (verify-member, link-member, dll).
 * Better Auth (session/OAuth) ditangani oleh BetterAuthModule secara terpisah.
 * PrismaService tersedia global dari DatabaseModule — tidak perlu di-import lagi.
 */
@Module({
  controllers: [AuthController],
  providers:   [AuthService, TwoFactorService],
  exports:     [AuthService],
})
export class AuthModule {}
