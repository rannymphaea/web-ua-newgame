/**
 * Role Constants — NEWGAME V1.1
 *
 * Single source of truth untuk role system.
 * Semua guard, decorator, dan middleware harus mereferensi file ini.
 */

// ── Role Names ────────────────────────────────────────────────
export type RoleName =
  | 'npc'
  | 'member'
  | 'inventori'
  | 'admin'
  | 'quest keeper'
  | 'gold guardian'
  | 'code commander'
  | 'pixel presiden';

// ── Role Hierarchy (level rendah → tinggi) ────────────────────
// Digunakan oleh RolesGuard untuk menentukan akses berbasis hierarki.
export const ROLE_HIERARCHY: Record<string, number> = {
  'npc':              0,
  'member':           1,
  'inventori':        2,
  'admin':            3,
  'quest keeper':     4,
  'gold guardian':    5,
  'code commander':   6,
  'pixel presiden':   7,
};

// ── Permission Matrix ─────────────────────────────────────────
//
// ROLE_PERMISSIONS matrix:
//   pixel presiden  → semua akses
//   code commander  → semua kecuali hapus pixel presiden
//   gold guardian   → kelola keuangan, event, presensi, member
//   quest keeper    → kelola event, presensi, member, laporan
//   admin           → kelola event, presensi, member
//   inventori       → akses inventori + dashboard + presensi + profil
//   member          → dashboard, presensi, profil pribadi
//   npc             → hanya halaman publik (landing page)
//

export enum Permission {
  // Public
  VIEW_PUBLIC       = 'view_public',

  // Member-level
  VIEW_DASHBOARD    = 'view_dashboard',
  ATTEND_EVENT      = 'attend_event',
  VIEW_PROFILE      = 'view_profile',
  EDIT_OWN_PROFILE  = 'edit_own_profile',
  VIEW_LEADERBOARD  = 'view_leaderboard',
  VIEW_NEWS         = 'view_news',
  VIEW_BADGES       = 'view_badges',

  // Inventori-level
  MANAGE_INVENTORY  = 'manage_inventory',

  // Admin-level
  MANAGE_MEMBERS    = 'manage_members',
  MANAGE_EVENTS     = 'manage_events',
  MANAGE_ATTENDANCE = 'manage_attendance',
  MANAGE_NEWS       = 'manage_news',
  VIEW_LOGS         = 'view_logs',

  // Quest Keeper (sekretaris)
  MANAGE_REPORTS    = 'manage_reports',
  EXPORT_DATA       = 'export_data',

  // Gold Guardian (bendahara)
  MANAGE_FINANCE    = 'manage_finance',

  // Code Commander + Pixel Presiden
  MANAGE_ROLES      = 'manage_roles',
  MANAGE_ADMINS     = 'manage_admins',
  VIEW_ANALYTICS    = 'view_analytics',
  FULL_ACCESS       = 'full_access',
}

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  'npc': [
    Permission.VIEW_PUBLIC,
  ],
  'member': [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_DASHBOARD,
    Permission.ATTEND_EVENT,
    Permission.VIEW_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_LEADERBOARD,
    Permission.VIEW_NEWS,
    Permission.VIEW_BADGES,
  ],
  'inventori': [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_DASHBOARD,
    Permission.ATTEND_EVENT,
    Permission.VIEW_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_LEADERBOARD,
    Permission.VIEW_NEWS,
    Permission.VIEW_BADGES,
    Permission.MANAGE_INVENTORY,
  ],
  'admin': [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_DASHBOARD,
    Permission.ATTEND_EVENT,
    Permission.VIEW_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_LEADERBOARD,
    Permission.VIEW_NEWS,
    Permission.VIEW_BADGES,
    Permission.MANAGE_MEMBERS,
    Permission.MANAGE_EVENTS,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_NEWS,
    Permission.VIEW_LOGS,
  ],
  'quest keeper': [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_DASHBOARD,
    Permission.ATTEND_EVENT,
    Permission.VIEW_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_LEADERBOARD,
    Permission.VIEW_NEWS,
    Permission.VIEW_BADGES,
    Permission.MANAGE_MEMBERS,
    Permission.MANAGE_EVENTS,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_NEWS,
    Permission.VIEW_LOGS,
    Permission.MANAGE_REPORTS,
    Permission.EXPORT_DATA,
  ],
  'gold guardian': [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_DASHBOARD,
    Permission.ATTEND_EVENT,
    Permission.VIEW_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_LEADERBOARD,
    Permission.VIEW_NEWS,
    Permission.VIEW_BADGES,
    Permission.MANAGE_MEMBERS,
    Permission.MANAGE_EVENTS,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_NEWS,
    Permission.VIEW_LOGS,
    Permission.MANAGE_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_FINANCE,
  ],
  'code commander': [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_DASHBOARD,
    Permission.ATTEND_EVENT,
    Permission.VIEW_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_LEADERBOARD,
    Permission.VIEW_NEWS,
    Permission.VIEW_BADGES,
    Permission.MANAGE_MEMBERS,
    Permission.MANAGE_EVENTS,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_NEWS,
    Permission.VIEW_LOGS,
    Permission.MANAGE_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_FINANCE,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_ADMINS,
    Permission.VIEW_ANALYTICS,
  ],
  'pixel presiden': [
    Permission.FULL_ACCESS,
  ],
};

/** Check if a role has a specific permission */
export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as RoleName];
  if (!perms) return false;
  return perms.includes(Permission.FULL_ACCESS) || perms.includes(permission);
}

/** Get display name for role (for UI) */
export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  'npc':              'NPC',
  'member':           'Member',
  'inventori':        'Inventori',
  'admin':            'Admin',
  'quest keeper':     'Quest Keeper',
  'gold guardian':    'Gold Guardian',
  'code commander':   'Code Commander',
  'pixel presiden':   'Pixel Presiden',
};
