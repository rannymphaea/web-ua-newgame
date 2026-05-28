import { Module } from '@nestjs/common';
import { CyberDefenseService } from './cyber-defense.service';
import { CyberDefenseController } from './cyber-defense.controller';

@Module({
  controllers: [CyberDefenseController],
  providers:   [CyberDefenseService],
  exports:     [CyberDefenseService],
})
export class CyberDefenseModule {}
