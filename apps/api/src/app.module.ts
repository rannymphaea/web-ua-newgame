import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MembersModule } from './modules/members/members.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { XpModule } from './modules/xp/xp.module';
import { BadgesModule } from './modules/badges/badges.module';
import { EventsModule } from './modules/events/events.module';
import { NewsModule } from './modules/news/news.module';
import { LeaveModule } from './modules/leave/leave.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { LogsModule } from './modules/logs/logs.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnomaliesModule } from './modules/anomalies/anomalies.module';
import { CyberDefenseModule } from './modules/cyber-defense/cyber-defense.module';
import { ExportModule } from './modules/export/export.module';
import { ImportModule } from './modules/import/import.module';
import { PillarLevelsModule } from './modules/pillar-levels/pillar-levels.module';
import { UserHistoryModule } from './modules/user-history/user-history.module';
import { UserVaultModule } from './modules/user-vault/user-vault.module';
import { AiModule } from './modules/ai/ai.module';
import { RedisModule } from './common/redis/redis.module';
import { DatabaseModule } from './database/database.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Global rate limiter (in-memory fallback layer) ─────────────────
    // Layer 1: Nginx  — 30 req/s general, 5 req/min auth
    // Layer 2: @nestjs/throttler — in-memory, 100 req/min default
    // Layer 3: RateLimitGuard   — Redis-backed, per-route custom limits
    ThrottlerModule.forRoot([
      {
        name:   'global',
        ttl:    60_000,   // 1 menit
        limit:  100,      // 100 req/menit per IP
      },
      {
        name:   'short',
        ttl:    10_000,   // 10 detik
        limit:  20,       // maks 20 req/10 detik (anti-burst)
      },
    ]),

    FirebaseModule,
    AuthModule,
    UsersModule,
    MembersModule,
    AttendanceModule,
    XpModule,
    BadgesModule,
    EventsModule,
    NewsModule,
    LeaveModule,
    MediaModule,
    NotificationsModule,
    LogsModule,
    DashboardModule,
    AnomaliesModule,
    CyberDefenseModule,
    ExportModule,
    ImportModule,
    PillarLevelsModule,
    UserHistoryModule,
    UserVaultModule,
    AiModule,
    RedisModule,
    DatabaseModule,
  ],
  providers: [
    // Aktifkan ThrottlerGuard secara global — berlaku untuk semua route
    {
      provide:  APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}