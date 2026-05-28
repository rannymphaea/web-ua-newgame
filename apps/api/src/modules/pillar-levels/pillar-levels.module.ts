import { Module } from '@nestjs/common';
import { PillarLevelsController } from './pillar-levels.controller';
import { PillarLevelsService } from './pillar-levels.service';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [PillarLevelsController],
  providers: [PillarLevelsService],
  exports: [PillarLevelsService],
})
export class PillarLevelsModule {}
