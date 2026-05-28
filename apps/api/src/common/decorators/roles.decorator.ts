import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator untuk menentukan role minimum yang dibutuhkan.
 * Karena ada hierarchy, cukup pass role terendah yang diperbolehkan.
 * Contoh: @Roles('admin') → admin, superadmin, presiden bisa akses
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
