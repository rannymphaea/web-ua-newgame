import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AnomaliesService } from './anomalies.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('anomalies')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class AnomaliesController {
  constructor(private anomaliesService: AnomaliesService) {}

  @Get()
  async getAnomalies(
    @Query('type') type?: string,
    @Query('resolved') resolved?: string,
    @Query('limit') limit?: string,
  ) {
    return this.anomaliesService.getAnomalies({
      type,
      resolved: resolved !== undefined ? resolved === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Patch(':id/resolve')
  async resolveAnomaly(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { note?: string },
  ) {
    return this.anomaliesService.resolveAnomaly(id, user.uid, body.note);
  }
}
