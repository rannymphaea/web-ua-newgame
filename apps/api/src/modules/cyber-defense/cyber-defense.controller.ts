import {
  Controller, Get, Post, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { CyberDefenseService } from './cyber-defense.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('cyber-defense')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class CyberDefenseController {
  constructor(private readonly defense: CyberDefenseService) {}

  /** Real-time monitoring snapshot */
  @Get('monitor')
  monitor() {
    return this.defense.getMonitoringSnapshot();
  }

  /** Recent threat events */
  @Get('events')
  events(@Query('limit') limit?: string) {
    return { events: this.defense.getRecentEvents(parseInt(limit || '50')) };
  }

  /** Info per IP */
  @Get('ip/:ip')
  ipInfo(@Param('ip') ip: string) {
    return this.defense.getIpInfo(ip);
  }

  /** Manual block IP */
  @Post('block')
  blockIp(@Body() body: { ip: string; reason?: string }) {
    this.defense.block(body.ip, body.reason || 'manual_admin_block');
    return { success: true, message: `IP ${body.ip} blocked` };
  }

  /** Unblock IP */
  @Delete('block/:ip')
  unblockIp(@Param('ip') ip: string) {
    this.defense.unblock(ip);
    return { success: true, message: `IP ${ip} unblocked` };
  }
}
