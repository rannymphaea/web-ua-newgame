import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PillarLevelsService } from './pillar-levels.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('pillar-levels')
@UseGuards(FirebaseAuthGuard)
export class PillarLevelsController {
  constructor(private service: PillarLevelsService) {}

  @Get('definitions')
  getDefinitions() {
    return this.service.getDefinitions();
  }

  @Get('my')
  async getMyLevels(@CurrentUser() user: any) {
    return this.service.getUserPillarLevel(user.uid);
  }

  @Get('user/:userId')
  async getUserLevels(@Param('userId') userId: string) {
    return this.service.getUserPillarLevel(userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAll() {
    return this.service.getAllMemberLevels();
  }

  @Post('assign')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async assign(
    @CurrentUser() user: any,
    @Body() body: { userId: string; pillarId: string; level: number },
  ) {
    return this.service.assignLevel(body.userId, body.pillarId, body.level, user.uid);
  }
}
