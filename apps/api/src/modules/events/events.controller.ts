import { Controller, Post, Get, Param, Query, Body, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('events')
@UseGuards(FirebaseAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  /**
   * POST /api/events
   * Buat event baru (admin+)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createEvent(
    @CurrentUser() user: any,
    @Body() body: { name: string; description?: string; xpReward?: number; xpPenalty?: number },
  ) {
    return this.eventsService.createEvent(user.uid, body);
  }

  /**
   * GET /api/events
   * List semua events
   */
  @Get()
  async getEvents(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.eventsService.getEvents(status, parseInt(limit) || 20);
  }

  /**
   * POST /api/events/:eventId/generate-token
   * Generate QR token untuk event (admin+)
   */
  @Post(':eventId/generate-token')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async generateToken(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.generateToken(eventId, user.uid);
  }

  /**
   * POST /api/events/:eventId/close
   * Tutup event dan distribusi XP (admin+)
   */
  @Post(':eventId/close')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async closeEvent(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
    @Body() body: { approverId?: string },
  ) {
    return this.eventsService.closeEvent(eventId, user.uid, user.role, body.approverId);
  }
}
