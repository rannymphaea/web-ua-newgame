"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.CACHE_KEYS = exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RedisClass = null;
try {
    const upstash = require('@upstash/redis');
    RedisClass = upstash.Redis;
}
catch {
}
let RedisService = RedisService_1 = class RedisService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.redis = null;
        this.available = false;
    }
    onModuleInit() {
        if (!RedisClass) {
            this.logger.warn('@upstash/redis belum terinstall — jalankan npm install di apps/api');
            return;
        }
        const url = this.config.get('UPSTASH_REDIS_REST_URL');
        const token = this.config.get('UPSTASH_REDIS_REST_TOKEN');
        if (!url || !token) {
            this.logger.warn('UPSTASH_REDIS env tidak ditemukan — Redis dinonaktifkan');
            return;
        }
        this.redis = new RedisClass({ url, token });
        this.available = true;
        this.logger.log('Upstash Redis terhubung ✓');
    }
    get isAvailable() { return this.available; }
    async get(key) {
        if (!this.available)
            return null;
        try {
            return (await this.redis.get(key));
        }
        catch (e) {
            this.logger.error(`Redis GET [${key}]`, e);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.available)
            return;
        try {
            const v = JSON.stringify(value);
            if (ttlSeconds)
                await this.redis.set(key, v, { ex: ttlSeconds });
            else
                await this.redis.set(key, v);
        }
        catch (e) {
            this.logger.error(`Redis SET [${key}]`, e);
        }
    }
    async del(...keys) {
        if (!this.available || !keys.length)
            return;
        try {
            await this.redis.del(...keys);
        }
        catch (e) {
            this.logger.error(`Redis DEL [${keys}]`, e);
        }
    }
    async delPattern(pattern) {
        if (!this.available)
            return;
        try {
            let cursor = 0;
            do {
                const [next, keys] = await this.redis.scan(cursor, { match: pattern, count: 100 });
                cursor = Number(next);
                if (keys.length)
                    await this.redis.del(...keys);
            } while (cursor !== 0);
        }
        catch (e) {
            this.logger.error(`Redis SCAN DEL [${pattern}]`, e);
        }
    }
    async cached(key, fn, ttl = 60) {
        const hit = await this.get(key);
        if (hit !== null)
            return hit;
        const fresh = await fn();
        await this.set(key, fresh, ttl);
        return fresh;
    }
    async checkRateLimit(identifier, maxRequests, windowSeconds) {
        const fallback = { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
        if (!this.available)
            return fallback;
        try {
            const key = `rl:${identifier}`;
            const count = await this.redis.incr(key);
            if (count === 1)
                await this.redis.expire(key, windowSeconds);
            const ttl = await this.redis.ttl(key);
            const resetAt = Date.now() + (ttl > 0 ? ttl : windowSeconds) * 1000;
            return { allowed: count <= maxRequests, remaining: Math.max(0, maxRequests - count), resetAt };
        }
        catch (e) {
            this.logger.error('Rate limit check error', e);
            return fallback;
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
exports.CACHE_KEYS = {
    leaderboardAll: 'leaderboard:all',
    membersList: 'members:list',
    newsPublished: 'news:published',
    newsArticle: (id) => `news:article:${id}`,
    userProfile: (uid) => `user:${uid}:profile`,
    dashboardStats: 'dashboard:stats',
    activeEvents: 'events:active',
};
exports.CACHE_TTL = {
    leaderboard: 60,
    members: 120,
    news: 300,
    newsArticle: 600,
    userProfile: 60,
    dashboard: 30,
    events: 60,
};
//# sourceMappingURL=redis.service.js.map