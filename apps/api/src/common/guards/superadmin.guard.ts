import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SuperadminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req  = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user || user.role !== 'superadmin') {
      throw new ForbiddenException('Superadmin only');
    }
    return true;
  }
}
