'use client';
/**
 * NEWGAME — Session Cache Manager (PART 3)
 * Lightweight user session caching agar tidak memberatkan Firestore.
 *
 * Strategy:
 *   1. UserData di-cache ke sessionStorage (per-tab, auto-clear saat close)
 *   2. Token di-cache agar tidak re-fetch di setiap request
 *   3. Dashboard stats di-cache dengan TTL 5 menit
 *   4. Leaderboard di-cache dengan TTL 2 menit
 *
 * Keuntungan:
 *   - Mengurangi Firestore read operations secara drastis
 *   - First paint dari cache, background refresh otomatis
 *   - Zero re-fetch bila data belum stale
 */

const SESSION_KEY   = 'ng_user_session';
const CACHE_VERSION = 'v2';

interface CachedSession {
  version:    string;
  uid:        string;
  userData:   Record<string, unknown>;
  cachedAt:   number;
  ttlMs:      number;
}

interface CacheEntry<T> {
  data:      T;
  cachedAt:  number;
  ttlMs:     number;
}

// ── Session (UserData) Cache ────────────────────────────────────
export const SessionCache = {
  /** Simpan userData ke sessionStorage setelah login */
  set(uid: string, userData: Record<string, unknown>, ttlMinutes = 60): void {
    if (typeof window === 'undefined') return;
    try {
      const entry: CachedSession = {
        version:  CACHE_VERSION,
        uid,
        userData,
        cachedAt: Date.now(),
        ttlMs:    ttlMinutes * 60_000,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(entry));
    } catch { /* quota exceeded — ignore */ }
  },

  /** Ambil userData dari cache (null jika expired atau tidak ada) */
  get(uid: string): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const entry: CachedSession = JSON.parse(raw);
      // Validate version, uid match, dan TTL
      if (
        entry.version !== CACHE_VERSION ||
        entry.uid !== uid ||
        Date.now() - entry.cachedAt > entry.ttlMs
      ) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return entry.userData;
    } catch { return null; }
  },

  /** Hapus saat logout */
  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(SESSION_KEY);
  },

  /** Update partial fields tanpa overwrite semua */
  patch(uid: string, partial: Record<string, unknown>): void {
    const existing = this.get(uid);
    if (!existing) return;
    this.set(uid, { ...existing, ...partial });
  },
};

// ── Generic TTL Cache (untuk API responses) ─────────────────────
class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, { data, cachedAt: Date.now(), ttlMs: ttlSeconds * 1000 });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > entry.ttlMs) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  invalidate(key: string): void { this.store.delete(key); }
  invalidatePrefix(prefix: string): void {
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }
  clear(): void { this.store.clear(); }
}

/** Singleton in-memory cache — shared across all components */
export const apiCache = new TTLCache();

// ── Pre-configured TTLs ─────────────────────────────────────────
export const CACHE_TTL = {
  DASHBOARD_STATS:  5  * 60,  // 5 menit
  LEADERBOARD:      2  * 60,  // 2 menit
  NEWS_SLIDER:      10 * 60,  // 10 menit
  EVENTS:           3  * 60,  // 3 menit
  BADGES:           15 * 60,  // 15 menit
  PROFILE:          5  * 60,  // 5 menit
  MEMBERS:          2  * 60,  // 2 menit
} as const;

// ── Cached fetch helper ─────────────────────────────────────────
/**
 * Fetch dengan cache. Jika cache hit → return langsung.
 * Jika cache miss → fetch, simpan, return.
 *
 * @example
 * const stats = await cachedFetch(
 *   () => api.get('/users/dashboard'),
 *   'dashboard-stats',
 *   CACHE_TTL.DASHBOARD_STATS
 * );
 */
export async function cachedFetch<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  ttlSeconds: number,
): Promise<T> {
  const cached = apiCache.get<T>(cacheKey);
  if (cached !== null) return cached;

  const data = await fetchFn();
  apiCache.set(cacheKey, data, ttlSeconds);
  return data;
}

/**
 * Stale-while-revalidate: return cache immediately,
 * then refresh in background. Komponen akan re-render
 * dengan data terbaru saat fetch selesai.
 */
export function staleWhileRevalidate<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  ttlSeconds: number,
  onUpdate: (data: T) => void,
): T | null {
  const cached = apiCache.get<T>(cacheKey);
  // Always re-fetch in background
  fetchFn()
    .then(data => {
      apiCache.set(cacheKey, data, ttlSeconds);
      onUpdate(data);
    })
    .catch(() => {/* silently ignore background errors */});
  return cached;
}
