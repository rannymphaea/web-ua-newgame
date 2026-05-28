import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { FirebaseModule } from '../../firebase/firebase.module';
import { UserHistoryModule } from '../user-history/user-history.module';
import { UserVaultModule } from '../user-vault/user-vault.module';

@Module({
  imports:     [FirebaseModule, UserHistoryModule, UserVaultModule],
  providers:   [MembersService],
  controllers: [MembersController],
  exports:     [MembersService],
})
export class MembersModule {}
