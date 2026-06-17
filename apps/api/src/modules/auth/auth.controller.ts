import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { BetterAuthGuard, SkipAuth } from '../../common/guards/better-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RateLimitGuard, RateLimit } from '../../common/guards/rate-limit.guard';

/**
 * AuthController — endpoint tambahan di luar Better Auth bawaan.
 *
 * Route Better Auth (session, sign-in, sign-up, OAuth) ditangani di:
 *   /api/auth/* → BetterAuthController (src/auth/better-auth.controller.ts)
 *
 * Route ini untuk alur NEWGAME custom:
 *   POST /api/auth/verify-member   → validasi Member ID + kode akses (sebelum registrasi)
 *   POST /api/auth/link-member     → hubungkan Member ke akun setelah Better Auth register
 *   POST /api/auth/lookup-id       → resolve Member ID ke email (untuk login via ID)
 *   GET  /api/auth/me              → profil lengkap user yang login
 *   POST /api/auth/set-role        → ubah role user (admin only)
 *   GET  /api/auth/users           → list semua user (superadmin only)
 */
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
  ) {}

  /**
   * POST /api/auth/verify-member
   * Validasi Member ID + kode akses SEBELUM proses registrasi Better Auth.
   * Rate limit ketat: 5 percobaan / 15 menit per IP.
   */
  @Post('verify-member')
  @SkipAuth()
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 5, windowSeconds: 900, keyPrefix: 'verify-member' })
  async verifyMember(@Body() body: { memberId: string; tempPassword: string }) {
    return this.authService.verifyMember(body.memberId, body.tempPassword);
  }

  /**
   * POST /api/auth/lookup-id
   * Resolve Member ID ke email untuk login unified (ID atau email).
   * Rate limit: 5 percobaan / 15 menit.
   */
  @Post('lookup-id')
  @SkipAuth()
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 5, windowSeconds: 900, keyPrefix: 'lookup-id' })
  async lookupById(@Body() body: { memberId: string }) {
    return this.authService.lookupByMemberId(body.memberId);
  }

  /**
   * POST /api/auth/link-member
   * Dipanggil SETELAH Better Auth berhasil buat akun.
   * Menghubungkan User Better Auth dengan record Member di PostgreSQL.
   * Body: { memberId: "NG11020038PG" }
   */
  @Post('link-member')
  @UseGuards(BetterAuthGuard, RateLimitGuard)
  @RateLimit({ limit: 3, windowSeconds: 3600, keyPrefix: 'link-member' })
  async linkMember(
    @CurrentUser() user: any,
    @Body() body: { memberId: string },
  ) {
    return this.authService.linkMemberToUser(user.id, body.memberId);
  }

  /** GET /api/auth/me — profil lengkap user yang sedang login */
  @Get('me')
  @UseGuards(BetterAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getUserProfile(user.id);
  }

  /**
   * POST /api/auth/set-role
   * Ubah role user. Superadmin: semua role. Admin: hanya ke 'member'.
   */
  @Post('set-role')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('admin')
  async setRole(
    @CurrentUser() caller: any,
    @Body() body: { userId: string; role: string },
  ) {
    return this.authService.setUserRole(body.userId, body.role, caller.role);
  }

  /** GET /api/auth/users — list semua user (superadmin / code commander only) */
  @Get('users')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('code commander')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  // ── 2FA Endpoints ─────────────────────────────────────────────────────────

  /** POST /api/auth/2fa/setup — Generate TOTP secret */
  @Post('2fa/setup')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('admin')
  async twoFactorSetup(@CurrentUser() user: any) {
    return this.twoFactorService.setup(user.id);
  }

  /** POST /api/auth/2fa/verify — Verify code and enable 2FA */
  @Post('2fa/verify')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('admin')
  async twoFactorVerify(@CurrentUser() user: any, @Body() body: { code: string }) {
    return this.twoFactorService.verify(user.id, body.code);
  }

  /** POST /api/auth/2fa/validate — Validate TOTP on login */
  @Post('2fa/validate')
  @UseGuards(BetterAuthGuard)
  async twoFactorValidate(@CurrentUser() user: any, @Body() body: { code: string }) {
    return this.twoFactorService.validate(user.id, body.code);
  }

  /** POST /api/auth/2fa/disable — Disable 2FA */
  @Post('2fa/disable')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('admin')
  async twoFactorDisable(@CurrentUser() user: any, @Body() body: { code: string }) {
    return this.twoFactorService.disable(user.id, body.code);
  }

  /** GET /api/auth/2fa/status — Check if 2FA enabled */
  @Get('2fa/status')
  @UseGuards(BetterAuthGuard)
  async twoFactorStatus(@CurrentUser() user: any) {
    return this.twoFactorService.status(user.id);
  }
}
