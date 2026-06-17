import { Module } from '@nestjs/common';
import { BetterAuthController } from './better-auth.controller';

/**
 * BetterAuthModule — daftarkan controller Better Auth.
 * Import di AppModule untuk mengaktifkan semua route /api/auth/*.
 */
@Module({
  controllers: [BetterAuthController],
})
export class BetterAuthModule {}
