import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Response } from 'express';

@Controller('export')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class ExportController {
  constructor(private service: ExportService) {}

  @Get('attendance')
  async exportAttendance(@Query('eventId') eventId: string, @Res() res: Response) {
    const csv = await this.service.exportAttendanceCSV(eventId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
    res.send(csv);
  }

  @Get('members')
  async exportMembers(@Res() res: Response) {
    const csv = await this.service.exportMembersCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
    res.send(csv);
  }

  @Get('users')
  async exportUsers(@Res() res: Response) {
    const csv = await this.service.exportUsersCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  }
}
