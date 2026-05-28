import { Controller, Post, Get, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('attendance')
@UseGuards(FirebaseAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  /**
   * POST /api/attendance/process
   * Proses scan QR absensi
   */
  @Post('process')
  async processAttendance(
    @CurrentUser() user: any,
    @Body() body: { tokenId: string; deviceFingerprint: string },
  ) {
    return this.attendanceService.processAttendance(
      user.uid,
      body.tokenId,
      body.deviceFingerprint,
    );
  }

  /**
   * GET /api/attendance/history
   * Riwayat absensi user sendiri
   */
  @Get('history')
  async getMyHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    return this.attendanceService.getAttendanceHistory(user.uid, parseInt(limit) || 20);
  }

  /**
   * GET /api/attendance/check/:eventId
   * Check if current user already attended this event
   */
  @Get('check/:eventId')
  async checkAttendance(
    @CurrentUser() user: any,
    @Param('eventId') eventId: string,
  ) {
    return this.attendanceService.checkAttendance(user.uid, eventId);
  }

  /**
   * GET /api/attendance/event/:eventId
   * Semua absensi untuk event tertentu (admin+)
   */
  @Get('event/:eventId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getEventAttendance(@Param('eventId') eventId: string) {
    return this.attendanceService.getEventAttendance(eventId);
  }
}
