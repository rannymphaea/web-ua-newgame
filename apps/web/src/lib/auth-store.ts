'use client';
/**
 * Auth Store — NEWGAME (Better Auth)
 * ─────────────────────────────────────────────────────────────────────────────
 * Pengganti auth-store yang lama (pakai Firebase).
 * Sekarang menggunakan Better Auth session via cookie/API.
 *
 * MIGRATION NOTE:
 *   Lama: Firebase onAuthStateChanged + Firestore doc read
 *   Baru: Better Auth getSession → /api/auth/me (PostgreSQL)
 *
 * BACKWARD COMPAT:
 *   `userData` = alias untuk `user` (agar semua page yang lama tidak perlu diubah)
 *   `photoURL`  = alias untuk `image`
 *   `username`  = alias untuk `memberId` atau email-prefix
 *   `displayName` = alias untuk `name`
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { create } from 'zustand';
import { authClient } from './auth-client';
import { api } from './api';
import { SessionCache } from './session-cache';

export interface UserData {
  id:              string;
  name:            string;
  email:           string;
  role:            string;
  memberId:        string;
  pillar:          string;
  division:        string;
  image:           string;
  xpCache:         number;
  streak:          number;
  attendanceCount: number;
  status:          string;
  level:           number;
  // ── Backward-compat aliases (Firebase field names) ──────────────────────
  photoURL:        string;   // = image
  username:        string;   // = memberId (atau email prefix)
  displayName:     string;   // = name
}

interface AuthState {
  user:        UserData | null;
  /** Alias untuk `user` — agar semua halaman lama tidak perlu diubah */
  userData:    UserData | null;
  loading:     boolean;
  initialized: boolean;
  init:        () => Promise<void>;
  logout:      () => Promise<void>;
  refresh:     () => Promise<void>;
}

/** Bangun UserData dari response /api/auth/me + Better Auth session */
function buildUserData(profile: Record<string, any>, baUser: Record<string, any>): UserData {
  const name  = profile.displayName || profile.name || baUser.name || '';
  const email = profile.email       || baUser.email || '';
  const image = profile.image       || profile.photoURL || (baUser as any).image || '';
  const memberId = profile.memberId || '';

  // username: pakai memberId jika ada, fallback ke prefix email
  const username = memberId
    ? memberId
    : email
      ? email.split('@')[0]
      : '';

  return {
    id:              profile.id              || baUser.id,
    name,
    email,
    role:            profile.role            || 'member',
    memberId,
    pillar:          profile.pillar          || '',
    division:        profile.division        || '',
    image,
    xpCache:         profile.xpCache         ?? 0,
    streak:          profile.streak          ?? 0,
    attendanceCount: profile.attendanceCount ?? 0,
    status:          profile.status          || 'active',
    level:           profile.level           ?? Math.floor((profile.xpCache ?? 0) / 100) + 1,
    // ── Compat aliases ──────────────────────────────────────────────────
    photoURL:        image,
    username,
    displayName:     name,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:        null,
  userData:    null,   // alias untuk user
  loading:     true,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    try {
      // Cek session dari Better Auth cookie
      const session = await authClient.getSession();

      if (!session?.data?.user) {
        set({ user: null, userData: null, loading: false });
        api.setToken(null);
        return;
      }

      const baUser = session.data.user as any;

      // Cek cache lokal dulu untuk load cepat
      const cached = SessionCache.get(baUser.id) as UserData | null;
      if (cached) {
        set({ user: cached, userData: cached, loading: false });
        // Refresh di background
        get().refresh();
        return;
      }

      // Ambil profil lengkap dari API (PostgreSQL)
      const profileRes = await fetch('/api/auth/me', {
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
      });

      if (!profileRes.ok) {
        set({ user: null, userData: null, loading: false });
        api.setToken(null);
        return;
      }

      const profile = await profileRes.json();

      if (profile.status === 'suspended') {
        await authClient.signOut();
        set({ user: null, userData: null, loading: false });
        return;
      }

      const ud = buildUserData(profile, baUser);
      SessionCache.set(baUser.id, ud as unknown as Record<string, unknown>);
      set({ user: ud, userData: ud, loading: false });

    } catch {
      set({ user: null, userData: null, loading: false });
    }
  },

  refresh: async () => {
    try {
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        set({ user: null, userData: null });
        return;
      }

      const baUser = session.data.user as any;
      const profileRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!profileRes.ok) return;

      const profile = await profileRes.json();
      const ud = buildUserData(profile, baUser);
      SessionCache.set(baUser.id, ud as unknown as Record<string, unknown>);
      set({ user: ud, userData: ud });
    } catch { /* silent */ }
  },

  logout: async () => {
    await authClient.signOut();
    api.setToken(null);
    SessionCache.clear();
    set({ user: null, userData: null });
  },
}));
