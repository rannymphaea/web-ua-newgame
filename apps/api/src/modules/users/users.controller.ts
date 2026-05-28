import { Controller, Get, Patch, Param, Query, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.usersService.getDashboardStats(user.uid);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.usersService.getLeaderboard(parseInt(limit || '50'));
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  getAllUsers(@Query('role') role?: string) {
    return this.usersService.getAllUsers(role);
  }

  @Get(':userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  getUser(@Param('userId') userId: string) {
    return this.usersService.getUserById(userId);
  }

  /** PATCH /users/profile — strict DTO, validated, sanitized */
  @Patch('profile')
  updateProfile(@CurrentUser() user: any, @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.uid, dto);
  }

  @Patch(':userId/role')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  updateRole(@Param('userId') userId: string, @CurrentUser() user: any, @Body() body: { role: string }) {
    return this.usersService.updateUserRole(userId, body.role, user.uid);
  }

  @Patch(':userId/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin')
  updateStatus(@Param('userId') userId: string, @CurrentUser() user: any, @Body() body: { status: string }) {
    return this.usersService.updateUserStatus(userId, body.status, user.uid);
  }
}
