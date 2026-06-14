import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TwoFactorService],
  exports: [AuthService, TwoFactorService],
})
export class AuthModule {}
