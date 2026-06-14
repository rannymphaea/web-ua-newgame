import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  /** GET /notifications — notif saya */
  @Get()
  async getMine(@CurrentUser() user: any, @Query('limit') limit?: string) {
    return this.service.getUserNotifications(user.uid, limit ? parseInt(limit) : 20);
  }

  /** PATCH /notifications/:id/read — tandai dibaca */
  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  /** PATCH /notifications/read-all — tandai semua dibaca */
  @Patch('read-all')
  async markAllRead(@CurrentUser() user: any) {
    return this.service.markAllRead(user.uid);
  }

  /** GET /notifications/broadcasts — ambil pengumuman aktif */
  @Get('broadcasts')
  async getBroadcasts() {
    return this.service.getActiveBroadcasts();
  }

  /** POST /notifications/broadcasts/:id/dismiss — sembunyikan pengumuman */
  @Post('broadcasts/:id/dismiss')
  async dismissBroadcast(@Param('id') id: string) {
    return this.service.dismissBroadcast(id);
  }

  // ── Admin routes ────────────────────────────────────────────

  /** POST /notifications/send — kirim ke user spesifik (admin) */
  @Post('send')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async send(@Body() body: { userId: string; title: string; body: string; type?: string }) {
    return this.service.sendNotification(body.userId, body.title, body.body, body.type);
  }

  /** POST /notifications/broadcast — kirim ke semua user (admin) */
  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async broadcast(@CurrentUser() user: any, @Body() body: { title: string; body: string }) {
    return this.service.sendBroadcast(body.title, body.body, user.uid);
  }

  /** POST /notifications/reminder — kirim reminder event (admin) */
  @Post('reminder')
  @UseGuards(RolesGuard)
  @Roles('quest keeper')
  async reminder(@Body() body: { eventId: string }) {
    return this.service.sendEventReminder(body.eventId);
  }
}
