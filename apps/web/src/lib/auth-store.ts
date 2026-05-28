'use client';
// DO NOT EDIT - Auth state manager (Zustand). Mengatur login, logout, token refresh, dan proteksi rute.
import { create } from 'zustand';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { api } from './api';

interface UserData {
  name: string;
  username: string;
  email: string;
  role: string;
  division: string;
  memberId: string;
  photoURL: string;
  xpCache: number;
  streak: number;
  attendanceCount: number;
  status: string;
  level: number;
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  initialized: boolean;
  init: () => void;
  logout: () => Promise<void>;
}

/**
 * OPTIMISTIC INIT:
 * Firebase caches auth state in IndexedDB/localStorage.
 * On return visits, auth.currentUser is available synchronously —
 * no need to wait for onAuthStateChanged to show the UI.
 *
 * Strategy:
 *   - If auth.currentUser exists synchronously → loading = false immediately
 *   - If not → loading = true until onAuthStateChanged resolves
 * This eliminates the 1–3 second blank/spinner for logged-in users.
 */
const getOptimisticUser = () => {
  try { return auth.currentUser; } catch { return null; }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user:        null,
  userData:    null,
  // Start non-loading if Firebase already has a cached user
  loading:     getOptimisticUser() === null,
  initialized: false,

  init: () => {
    if (get().initialized) return;
    set({ initialized: true });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if ((globalThis as Record<string, unknown>).__ngTokenInterval) {
        clearInterval((globalThis as Record<string, unknown>).__ngTokenInterval as ReturnType<typeof setInterval>);
        (globalThis as Record<string, unknown>).__ngTokenInterval = null;
      }

      if (!user || !user.emailVerified) {
        set({ user: null, userData: null, loading: false });
        api.setToken(null);
        return;
      }

      // If we already showed UI optimistically, don't re-show spinner
      set(s => ({ loading: s.userData ? false : true }));

      try {
        const token = await user.getIdToken();
        api.setToken(token);

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().status === 'suspended') {
          await signOut(auth);
          set({ user: null, userData: null, loading: false });
          return;
        }

        const data = userDoc.data();
        const userData: UserData = {
          name:            data.name            || user.displayName || '',
          username:        data.username        || '',
          email:           data.email           || user.email || '',
          role:            data.role            || 'member',
          division:        data.division        || '',
          memberId:        data.memberId        || '',
          photoURL:        data.photoURL        || user.photoURL || '',
          xpCache:         data.xpCache         || 0,
          streak:          data.streak          || 0,
          attendanceCount: data.attendanceCount || 0,
          status:          data.status          || 'active',
          level:           Math.floor((data.xpCache || 0) / 100) + 1,
        };

        set({ user, userData, loading: false });

        (globalThis as Record<string, unknown>).__ngTokenInterval = setInterval(async () => {
          try { const t = await user.getIdToken(true); api.setToken(t); } catch { /* ignore */ }
        }, 10 * 60 * 1000);

      } catch {
        set({ user: null, userData: null, loading: false });
      }
    });

    (globalThis as Record<string, unknown>).__ngAuthUnsubscribe = unsubscribe;
  },

  logout: async () => {
    if ((globalThis as Record<string, unknown>).__ngTokenInterval) {
      clearInterval((globalThis as Record<string, unknown>).__ngTokenInterval as ReturnType<typeof setInterval>);
      (globalThis as Record<string, unknown>).__ngTokenInterval = null;
    }
    await signOut(auth);
    api.setToken(null);
    set({ user: null, userData: null });
  },
}));
