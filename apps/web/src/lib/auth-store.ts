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
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { create } from 'zustand';
import { authClient } from './auth-client';
import { api } from './api';
import { SessionCache } from './session-cache';

interface UserData {
  id:             string;
  name:           string;
  email:          string;
  role:           string;
  memberId:       string;
  pillar:         string;
  division:       string;
  image:          string;
  xpCache:        number;
  streak:         number;
  attendanceCount:number;
  status:         string;
  level:          number;
}

interface AuthState {
  user:        UserData | null;
  loading:     boolean;
  initialized: boolean;
  init:        () => Promise<void>;
  logout:      () => Promise<void>;
  refresh:     () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:        null,
  loading:     true,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    try {
      // Cek session dari Better Auth cookie
      const session = await authClient.getSession();

      if (!session?.data?.user) {
        set({ user: null, loading: false });
        api.setToken(null);
        return;
      }

      const baUser = session.data.user;

      // Cek cache lokal dulu untuk load cepat
      const cached = SessionCache.get(baUser.id) as UserData | null;
      if (cached) {
        set({ user: cached, loading: false });
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
        set({ user: null, loading: false });
        api.setToken(null);
        return;
      }

      const profile = await profileRes.json();

      if (profile.status === 'suspended') {
        await authClient.signOut();
        set({ user: null, loading: false });
        return;
      }

      const userData: UserData = {
        id:             profile.id             || baUser.id,
        name:           profile.displayName    || baUser.name || '',
        email:          profile.email          || baUser.email || '',
        role:           profile.role           || 'member',
        memberId:       profile.memberId       || '',
        pillar:         profile.pillar         || '',
        division:       profile.division       || '',
        image:          profile.image          || (baUser as any).image || '',
        xpCache:        profile.xpCache        || 0,
        streak:         profile.streak         || 0,
        attendanceCount:profile.attendanceCount|| 0,
        status:         profile.status         || 'active',
        level:          profile.level          || Math.floor((profile.xpCache || 0) / 100) + 1,
      };

      SessionCache.set(baUser.id, userData as unknown as Record<string, unknown>);
      set({ user: userData, loading: false });

    } catch {
      set({ user: null, loading: false });
    }
  },

  refresh: async () => {
    try {
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        set({ user: null });
        return;
      }

      const profileRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!profileRes.ok) return;

      const profile = await profileRes.json();
      const userData: UserData = {
        id:             profile.id             || session.data.user.id,
        name:           profile.displayName    || session.data.user.name || '',
        email:          profile.email          || session.data.user.email || '',
        role:           profile.role           || 'member',
        memberId:       profile.memberId       || '',
        pillar:         profile.pillar         || '',
        division:       profile.division       || '',
        image:          profile.image          || '',
        xpCache:        profile.xpCache        || 0,
        streak:         profile.streak         || 0,
        attendanceCount:profile.attendanceCount|| 0,
        status:         profile.status         || 'active',
        level:          profile.level          || 1,
      };

      SessionCache.set(session.data.user.id, userData as unknown as Record<string, unknown>);
      set({ user: userData });
    } catch { /* silent */ }
  },

  logout: async () => {
    await authClient.signOut();
    api.setToken(null);
    SessionCache.clear();
    set({ user: null });
  },
}));
