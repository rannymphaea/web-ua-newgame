import { Module } from '@nestjs/common';
import { UserHistoryService } from './user-history.service';
import { UserHistoryController } from './user-history.controller';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  imports:     [FirebaseModule],
  providers:   [UserHistoryService],
  controllers: [UserHistoryController],
  exports:     [UserHistoryService],
})
export class UserHistoryModule {}
