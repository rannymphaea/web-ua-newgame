import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { FirebaseModule } from '../../firebase/firebase.module';
import { UserHistoryModule } from '../user-history/user-history.module';
import { UserVaultModule } from '../user-vault/user-vault.module';

@Module({
  imports:     [FirebaseModule, UserHistoryModule, UserVaultModule, MulterModule.register({})],
  providers:   [ImportService],
  controllers: [ImportController],
  exports:     [ImportService],
})
export class ImportModule {}
