import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Post('send')
  async send(@Body() body: { userId: string; title: string; body: string }) {
    return this.service.sendNotification(body.userId, body.title, body.body);
  }

  @Post('broadcast')
  async broadcast(@Body() body: { title: string; body: string }) {
    return this.service.sendBroadcast(body.title, body.body);
  }

  @Post('reminder')
  async reminder(@Body() body: { eventId: string }) {
    return this.service.sendEventReminder(body.eventId);
  }
}
