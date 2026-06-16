import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { UserHistoryModule } from '../user-history/user-history.module';
import { UserVaultModule } from '../user-vault/user-vault.module';

/**
 * MembersModule — Manajemen anggota via PostgreSQL (Prisma).
 * PrismaService di-inject otomatis dari DatabaseModule (global).
 */
@Module({
  imports:     [UserHistoryModule, UserVaultModule],
  providers:   [MembersService],
  controllers: [MembersController],
  exports:     [MembersService],
})
export class MembersModule {}
