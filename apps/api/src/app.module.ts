import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}