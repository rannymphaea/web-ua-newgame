import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { FirebaseModule } from '../../firebase/firebase.module';
import { ImportModule } from '../import/import.module';
import { UserHistoryModule } from '../user-history/user-history.module';

@Module({
  imports:     [FirebaseModule, ImportModule, UserHistoryModule],
  providers:   [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
