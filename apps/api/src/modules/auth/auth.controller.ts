import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/verify-member
   * Verifikasi ID member dan password sementara sebelum registrasi
   */
  @Post('verify-member')
  async verifyMember(@Body() body: { memberId: string; tempPassword: string }) {
    return this.authService.verifyMember(body.memberId, body.tempPassword);
  }

  /**
   * POST /api/auth/register
   * Buat profil user di Firestore setelah Firebase Auth registration
   */
  @Post('register')
  @UseGuards(FirebaseAuthGuard)
  async register(
    @CurrentUser() user: any,
    @Body() body: {
      memberId: string;
      displayName: string;
      division: string;
      team?: string;
    },
  ) {
    return this.authService.createUserProfile(user.uid, {
      memberId: body.memberId,
      email: user.email,
      displayName: body.displayName,
      division: body.division,
      team: body.team,
    });
  }

  /**
   * GET /api/auth/me
   * Ambil profil user yang sedang login
   */
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getUserProfile(user.uid);
  }

  /**
   * POST /api/auth/set-role
   * Update role user (admin+ only)
   */
  @Post('set-role')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  async setRole(@Body() body: { userId: string; role: string }) {
    return this.authService.setUserRole(body.userId, body.role);
  }
}
