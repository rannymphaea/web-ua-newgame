import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('logs')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class LogsController {
  constructor(private logsService: LogsService) {}

  @Get()
  async getLogs(
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.logsService.getLogs({
      action,
      userId,
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('export')
  async exportLogs(
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.logsService.exportLogs({ action, startDate, endDate });
  }
}
