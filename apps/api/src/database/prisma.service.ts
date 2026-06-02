/**
 * PrismaService — NestJS wrapper untuk Prisma Client
 * 
 * ⚠️ SETUP WAJIB sebelum run:
 *   cd apps/api
 *   npm install
 *   npx prisma generate   ← buat @prisma/client dari schema
 *   npx prisma migrate dev --name init
 * 
 * Inject PrismaService di module manapun setelah DatabaseModule diimport.
 */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

// Conditional import — aman jika @prisma/client belum ter-generate
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@prisma/client');
  } catch {
    return { PrismaClient: class {} };
  }
})();

@Injectable()
export class PrismaService extends (PrismaClient as any) implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _connected = false;

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      if (typeof (this as any).$connect === 'function') {
        await (this as any).$connect();
        this._connected = true;
        this.logger.log('PostgreSQL terhubung via Prisma ✓');
      } else {
        this.logger.warn(
          'PrismaClient belum ter-generate. Jalankan: npx prisma generate',
        );
      }
    } catch (e) {
      this.logger.error('Prisma koneksi gagal — pastikan DATABASE_URL sudah diset:', e);
      // Jangan crash app — Firebase masih bisa dipakai sementara
    }
  }

  async onModuleDestroy() {
    if (this._connected && typeof (this as any).$disconnect === 'function') {
      await (this as any).$disconnect();
    }
  }

  /** Cek apakah koneksi tersedia */
  get isConnected() { return this._connected; }
}
