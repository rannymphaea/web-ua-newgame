import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';
export interface RateLimitOptions {
    limit: number;
    windowSeconds: number;
    keyPrefix?: string;
}
export declare const RATE_LIMIT_KEY = "rate_limit";
export declare function RateLimit(opts: RateLimitOptions): (target: object, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
export declare const RATE_LIMIT_DEFAULTS: {
    auth: {
        limit: number;
        windowSeconds: number;
    };
    write: {
        limit: number;
        windowSeconds: number;
    };
    read: {
        limit: number;
        windowSeconds: number;
    };
    global: {
        limit: number;
        windowSeconds: number;
    };
};
export declare class RateLimitGuard implements CanActivate {
    private readonly reflector;
    private readonly redis;
    constructor(reflector: Reflector, redis: RedisService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
