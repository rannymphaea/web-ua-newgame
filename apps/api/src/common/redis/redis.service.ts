/**
 * RedisService — Upstash Redis wrapper untuk NEWGAME API
 *
 * ⚠️ SETUP WAJIB sebelum aktif:
 *   cd apps/api && npm install
 *   Set env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *
 * Graceful degradation: jika Redis tidak tersedia, semua operasi
 * di-skip secara diam-diam (tidak crash app).
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Conditional require agar tidak crash sebelum npm install
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let RedisClass: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const upstash = require('@upstash/redis');
  RedisClass = upstash.Redis;
} catch {
  // Package belum terinstall — akan di-log saat init
}

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private redis: any = null;
  private available = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    if (!RedisClass) {
      this.logger.warn('@upstash/redis belum terinstall — jalankan npm install di apps/api');
      return;
    }

    const url   = this.config.get<string>('UPSTASH_REDIS_REST_URL');
    const token = this.config.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!url || !token) {
      this.logger.warn('UPSTASH_REDIS env tidak ditemukan — Redis dinonaktifkan');
      return;
    }

    this.redis     = new RedisClass({ url, token });
    this.available = true;
    this.logger.log('Upstash Redis terhubung ✓');
  }

  get isAvailable() { return this.available; }

  /** Get nilai dari Redis, return null jika tidak ada atau Redis offline */
  async get<T>(key: string): Promise<T | null> {
    if (!this.available) return null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    try { return (await this.redis.get(key)) as T | null; }
    catch (e) { this.logger.error(`Redis GET [${key}]`, e); return null; }
  }

  /** Set nilai dengan TTL opsional (detik) */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.available) return;
    try {
      const v = JSON.stringify(value);
      if (ttlSeconds) await this.redis.set(key, v, { ex: ttlSeconds });
      else            await this.redis.set(key, v);
    } catch (e) { this.logger.error(`Redis SET [${key}]`, e); }
  }

  /** Hapus satu atau lebih key */
  async del(...keys: string[]): Promise<void> {
    if (!this.available || !keys.length) return;
    try { await this.redis.del(...keys); }
    catch (e) { this.logger.error(`Redis DEL [${keys}]`, e); }
  }

  /** Hapus semua key yang cocok dengan pattern via SCAN */
  async delPattern(pattern: string): Promise<void> {
    if (!this.available) return;
    try {
      let cursor = 0;
      do {
        const [next, keys] = await this.redis.scan(cursor, { match: pattern, count: 100 });
        cursor = Number(next);
        if (keys.length) await this.redis.del(...keys);
      } while (cursor !== 0);
    } catch (e) { this.logger.error(`Redis SCAN DEL [${pattern}]`, e); }
  }

  /**
   * Cache-aside: coba ambil dari cache, jika miss jalankan fn → simpan hasilnya.
   * @param key Cache key
   * @param fn  Fungsi async pengambil data asli
   * @param ttl TTL detik (default 60)
   */
  async cached<T>(key: string, fn: () => Promise<T>, ttl = 60): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null) return hit;
    const fresh = await fn();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  /**
   * Rate limiter berbasis Redis INCR + EXPIRE.
   * Fallback allow-all jika Redis tidak tersedia.
   */
  async checkRateLimit(
    identifier: string,
    maxRequests: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const fallback = { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
    if (!this.available) return fallback;

    try {
      const key   = `rl:${identifier}`;
      const count = await this.redis.incr(key);
      if (count === 1) await this.redis.expire(key, windowSeconds);
      const ttl    = await this.redis.ttl(key);
      const resetAt = Date.now() + (ttl > 0 ? ttl : windowSeconds) * 1000;
      return { allowed: count <= maxRequests, remaining: Math.max(0, maxRequests - count), resetAt };
    } catch (e) {
      this.logger.error('Rate limit check error', e);
      return fallback;
    }
  }
}

/* ── Cache key constants ───────────────────────────────────── */
export const CACHE_KEYS = {
  leaderboardAll:  'leaderboard:all',
  membersList:     'members:list',
  newsPublished:   'news:published',
  newsArticle:     (id: string) => `news:article:${id}`,
  userProfile:     (uid: string) => `user:${uid}:profile`,
  dashboardStats:  'dashboard:stats',
  activeEvents:    'events:active',
} as const;

/* ── Cache TTL constants (seconds) ────────────────────────── */
export const CACHE_TTL = {
  leaderboard: 60,
  members:     120,
  news:        300,
  newsArticle: 600,
  userProfile: 60,
  dashboard:   30,
  events:      60,
} as const;
