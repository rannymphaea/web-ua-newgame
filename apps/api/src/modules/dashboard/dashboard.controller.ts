import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/dashboard')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get()
  stats() { return this.svc.getStats(); }
}
