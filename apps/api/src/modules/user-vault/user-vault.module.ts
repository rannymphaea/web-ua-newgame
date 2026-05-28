import { Module } from '@nestjs/common';
import { UserVaultService } from './user-vault.service';
import { UserVaultController } from './user-vault.controller';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  imports:     [FirebaseModule],
  providers:   [UserVaultService],
  controllers: [UserVaultController],
  exports:     [UserVaultService],
})
export class UserVaultModule {}
