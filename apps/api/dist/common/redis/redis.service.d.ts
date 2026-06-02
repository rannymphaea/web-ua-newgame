import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    private redis;
    private available;
    constructor(config: ConfigService);
    onModuleInit(): void;
    get isAvailable(): boolean;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(...keys: string[]): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    cached<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>;
    checkRateLimit(identifier: string, maxRequests: number, windowSeconds: number): Promise<{
        allowed: boolean;
        remaining: number;
        resetAt: number;
    }>;
}
export declare const CACHE_KEYS: {
    readonly leaderboardAll: "leaderboard:all";
    readonly membersList: "members:list";
    readonly newsPublished: "news:published";
    readonly newsArticle: (id: string) => string;
    readonly userProfile: (uid: string) => string;
    readonly dashboardStats: "dashboard:stats";
    readonly activeEvents: "events:active";
};
export declare const CACHE_TTL: {
    readonly leaderboard: 60;
    readonly members: 120;
    readonly news: 300;
    readonly newsArticle: 600;
    readonly userProfile: 60;
    readonly dashboard: 30;
    readonly events: 60;
};
