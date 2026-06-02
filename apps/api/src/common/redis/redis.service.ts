/**
 * RedisService — Upstash Redis wrapper untuk NEWGAME API
 * 
 * Setup:
 *   npm install @upstash/redis
 *   Tambah ke .env:
 *     UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
 *     UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxx
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private redis!: Redis;
  private available = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url   = this.config.get<string>('UPSTASH_REDIS_REST_URL');
    const token = this.config.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!url || !token) {
      this.logger.warn('UPSTASH_REDIS env tidak tersedia — Redis dinonaktifkan');
      return;
    }

    this.redis    = new Redis({ url, token });
    this.available = true;
    this.logger.log('Upstash Redis terhubung ✓');
  }

  get isAvailable() { return this.available; }

  /** Get nilai dari Redis, return null jika tidak ada */
  async get<T>(key: string): Promise<T | null> {
    if (!this.available) return null;
    try {
      return await this.redis.get<T>(key);
    } catch (e) {
      this.logger.error(`Redis GET error [${key}]`, e);
      return null;
    }
  }

  /** Set nilai dengan TTL opsional (detik) */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.available) return;
    try {
      if (ttlSeconds) {
        await this.redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
      } else {
        await this.redis.set(key, JSON.stringify(value));
      }
    } catch (e) {
      this.logger.error(`Redis SET error [${key}]`, e);
    }
  }

  /** Hapus satu atau lebih key */
  async del(...keys: string[]): Promise<void> {
    if (!this.available) return;
    try {
      await this.redis.del(...keys);
    } catch (e) {
      this.logger.error(`Redis DEL error [${keys.join(',')}]`, e);
    }
  }

  /** Hapus key dengan pattern (SCAN-based, aman untuk production) */
  async delPattern(pattern: string): Promise<void> {
    if (!this.available) return;
    try {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await this.redis.scan(cursor, {
          match: pattern,
          count: 100,
        });
        cursor = Number(nextCursor);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } while (cursor !== 0);
    } catch (e) {
      this.logger.error(`Redis DEL pattern error [${pattern}]`, e);
    }
  }

  /**
   * Cache-aside helper: coba ambil dari cache, jika miss jalankan fn dan cache hasilnya.
   * @param key   Cache key
   * @param fn    Async function yang mengambil data asli
   * @param ttl   TTL dalam detik (default: 60)
   */
  async cached<T>(key: string, fn: () => Promise<T>, ttl = 60): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fn();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  /**
   * Rate limiter berbasis Redis.
   * @returns true jika masih dalam batas, false jika melebihi
   */
  async checkRateLimit(
    identifier: string,
    maxRequests: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    if (!this.available) {
      // Fallback: always allow jika Redis tidak tersedia
      return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
    }

    const key = `rl:${identifier}`;
    try {
      const count = await this.redis.incr(key);
      if (count === 1) {
        // Key baru — set expiry
        await this.redis.expire(key, windowSeconds);
      }
      const ttl = await this.redis.ttl(key);
      const resetAt = Date.now() + (ttl > 0 ? ttl : windowSeconds) * 1000;

      return {
        allowed: count <= maxRequests,
        remaining: Math.max(0, maxRequests - count),
        resetAt,
      };
    } catch (e) {
      this.logger.error('Rate limit check error', e);
      return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
    }
  }
}

/* ── Cache key constants (centralized untuk menghindari typo) ── */
export const CACHE_KEYS = {
  leaderboardAll:      'leaderboard:all',
  membersList:         'members:list',
  newsPublished:       'news:published',
  newsArticle:         (id: string) => `news:article:${id}`,
  userProfile:         (uid: string) => `user:${uid}:profile`,
  dashboardStats:      'dashboard:stats',
  activeEvents:        'events:active',
};

/* ── Cache TTL constants (seconds) ── */
export const CACHE_TTL = {
  leaderboard:   60,
  members:      120,
  news:         300,
  newsArticle:  600,
  userProfile:   60,
  dashboard:     30,
  events:        60,
};
