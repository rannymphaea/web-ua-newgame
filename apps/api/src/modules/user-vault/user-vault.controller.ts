import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserVaultService } from './user-vault.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('user-vault')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class UserVaultController {
  constructor(private readonly svc: UserVaultService) {}

  @Get(':userId/versions')
  versions(@Param('userId') uid: string, @Query('limit') limit?: string) {
    return this.svc.getVersions(uid, parseInt(limit || '20'));
  }

  @Get(':userId/latest')
  latest(@Param('userId') uid: string) {
    return this.svc.getLatest(uid);
  }

  @Get(':userId/diff')
  diff(@Param('userId') uid: string, @Query('a') a: string, @Query('b') b: string) {
    return this.svc.getDiff(uid, parseInt(a), parseInt(b));
  }
}
