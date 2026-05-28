import { Controller, Post, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('leave')
@UseGuards(FirebaseAuthGuard)
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post()
  async createLeaveRequest(
    @CurrentUser() user: any,
    @Body() body: { eventId: string; reason: string; type: 'sick' | 'personal' | 'academic' | 'other' },
  ) {
    return this.leaveService.createLeaveRequest(user.uid, body);
  }

  @Get()
  async getLeaveRequests(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('eventId') eventId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leaveService.getLeaveRequests(user.uid, user.role, {
      status,
      eventId,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async approveLeave(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { adminNote?: string },
  ) {
    return this.leaveService.updateLeaveStatus(id, user.uid, 'approved', body.adminNote);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async rejectLeave(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { adminNote?: string },
  ) {
    return this.leaveService.updateLeaveStatus(id, user.uid, 'rejected', body.adminNote);
  }
}
