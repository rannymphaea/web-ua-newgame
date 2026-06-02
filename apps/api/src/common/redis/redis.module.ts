import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * RedisModule — Global module, tersedia di seluruh app tanpa import ulang.
 * Import RedisModule di AppModule, lalu inject RedisService langsung.
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
