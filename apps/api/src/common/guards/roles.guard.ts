import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Role hierarchy (dari rendah ke tinggi):
 * member < pengurus < inventori < admin < superadmin < presiden
 */
const ROLE_HIERARCHY: Record<string, number> = {
  npc: 0,
  member: 1,
  pengurus: 2,
  inventori: 3,
  admin: 4,
  superadmin: 5,
  presiden: 6,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restriction
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('No role assigned');
    }

    const userRoleLevel = ROLE_HIERARCHY[user.role] ?? 0;

    // User harus punya role yang levelnya >= salah satu required role
    const hasRole = requiredRoles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role] ?? 999;
      return userRoleLevel >= requiredLevel;
    });

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
