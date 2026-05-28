import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FirebaseModule } from '../../firebase/firebase.module';
import { UserHistoryModule } from '../user-history/user-history.module';
import { UserVaultModule } from '../user-vault/user-vault.module';

@Module({
  imports:     [FirebaseModule, UserHistoryModule, UserVaultModule],
  controllers: [UsersController],
  providers:   [UsersService],
  exports:     [UsersService],
})
export class UsersModule {}
