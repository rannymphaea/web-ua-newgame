// DO NOT EDIT - Registrasi semua modul NestJS. Tambah modul baru di sini setelah modul dibuat.
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { EventsModule } from './modules/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { MembersModule } from './modules/members/members.module';
import { XpModule } from './modules/xp/xp.module';
import { LeaveModule } from './modules/leave/leave.module';
import { LogsModule } from './modules/logs/logs.module';
import { AnomaliesModule } from './modules/anomalies/anomalies.module';
import { NewsModule } from './modules/news/news.module';
import { MediaModule } from './modules/media/media.module';
import { BadgesModule } from './modules/badges/badges.module';
import { PillarLevelsModule } from './modules/pillar-levels/pillar-levels.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ExportModule } from './modules/export/export.module';
import { SecurityModule } from './common/security/security.module';
import { CyberDefenseModule } from './modules/cyber-defense/cyber-defense.module';
import { UserHistoryModule } from './modules/user-history/user-history.module';
import { UserVaultModule } from './modules/user-vault/user-vault.module';
import { ImportModule } from './modules/import/import.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    FirebaseModule,
    AuthModule,
    AttendanceModule,
    EventsModule,
    UsersModule,
    MembersModule,
    XpModule,
    LeaveModule,
    LogsModule,
    AnomaliesModule,
    NewsModule,
    MediaModule,
    BadgesModule,
    PillarLevelsModule,
    NotificationsModule,
    ExportModule,
    SecurityModule,
    CyberDefenseModule,
    UserHistoryModule,
    UserVaultModule,
    ImportModule,
    DashboardModule,
  ],
})
export class AppModule {}
