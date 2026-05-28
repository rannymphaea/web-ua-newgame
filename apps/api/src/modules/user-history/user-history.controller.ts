import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserHistoryService } from './user-history.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('user-history')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class UserHistoryController {
  constructor(private readonly svc: UserHistoryService) {}

  @Get('recent')
  recent(@Query('limit') limit?: string) {
    return this.svc.getRecent(parseInt(limit || '50'));
  }

  @Get(':userId')
  byUser(@Param('userId') uid: string, @Query('limit') limit?: string) {
    return this.svc.getByUser(uid, parseInt(limit || '20'));
  }
}
