import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('badges')
@UseGuards(FirebaseAuthGuard)
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Get('definitions')
  getDefinitions() {
    return this.badgesService.getDefinitions();
  }

  @Get('my')
  async getMyBadges(@CurrentUser() user: any) {
    return this.badgesService.getUserBadges(user.uid);
  }

  @Get('check')
  async checkMyBadges(@CurrentUser() user: any) {
    return this.badgesService.checkAndAward(user.uid);
  }

  @Get('user/:userId')
  async getUserBadges(@Param('userId') userId: string) {
    return this.badgesService.getUserBadges(userId);
  }

  @Post('award')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async awardBadge(
    @CurrentUser() user: any,
    @Body() body: { userId: string; badgeId: string },
  ) {
    return this.badgesService.awardBadge(body.userId, body.badgeId, user.uid);
  }

  @Post('revoke')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async revokeBadge(@Body() body: { userId: string; badgeId: string }) {
    return this.badgesService.revokeBadge(body.userId, body.badgeId);
  }
}
