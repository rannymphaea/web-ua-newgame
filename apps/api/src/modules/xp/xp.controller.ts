import { Controller, Post, Get, Param, Query, Body, UseGuards } from '@nestjs/common';
import { XpService } from './xp.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('xp')
@UseGuards(FirebaseAuthGuard)
export class XpController {
  constructor(private xpService: XpService) {}

  @Post('edit')
  @UseGuards(RolesGuard)
  @Roles('inventori')
  async editXP(
    @CurrentUser() user: any,
    @Body() body: { targetUserId: string; newXP: number; reason: string },
  ) {
    return this.xpService.editXPManual(
      body.targetUserId, body.newXP, body.reason, user.uid, user.role,
    );
  }

  @Get('history/:userId')
  async getHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.xpService.getXPHistory(userId, parseInt(limit) || 30);
  }
}
