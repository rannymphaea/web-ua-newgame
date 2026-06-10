import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_HIERARCHY } from '../constants/roles';

/**
 * Role hierarchy (dari rendah ke tinggi):
 * npc < member < inventori < admin < quest keeper < gold guardian < code commander < pixel presiden
 *
 * Roles imported from constants/roles.ts — single source of truth.
 */
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

    // NPC explicit rejection with user-friendly message
    if (userRoleLevel === 0) {
      throw new ForbiddenException(
        'Akun kamu belum diverifikasi sebagai anggota aktif. Hubungi admin untuk aktivasi.',
      );
    }

    // User harus punya role yang levelnya >= salah satu required role
    const hasRole = requiredRoles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role] ?? 999;
      return userRoleLevel >= requiredLevel;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        'Kamu tidak memiliki izin untuk mengakses fitur ini',
      );
    }

    return true;
  }
}
