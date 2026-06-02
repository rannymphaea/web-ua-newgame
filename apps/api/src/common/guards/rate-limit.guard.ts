import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RedisService } from '../redis/redis.service';

export interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window dalam detik */
  windowSeconds: number;
  /** Key prefix custom (default: ip) */
  keyPrefix?: string;
}

export const RATE_LIMIT_KEY = 'rate_limit';

/** Decorator — pakai di controller/route */
export function RateLimit(opts: RateLimitOptions) {
  return (target: object, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    Reflect.defineMetadata(RATE_LIMIT_KEY, opts, descriptor?.value ?? target);
    return descriptor;
  };
}

/* ── Default limits per endpoint type ── */
export const RATE_LIMIT_DEFAULTS = {
  /** Auth endpoints: 10 req/15 menit */
  auth:   { limit: 10,   windowSeconds: 900 },
  /** Write endpoints: 60 req/menit */
  write:  { limit: 60,   windowSeconds: 60  },
  /** Read endpoints: 300 req/menit */
  read:   { limit: 300,  windowSeconds: 60  },
  /** Global default: 100 req/menit */
  global: { limit: 100,  windowSeconds: 60  },
};

/**
 * RateLimitGuard — Redis-backed rate limiter.
 * Fallback gracefully ke allow-all jika Redis tidak tersedia.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http      = context.switchToHttp();
    const req       = http.getRequest<Request>();
    const res       = http.getResponse<Response>();

    // Ambil opsi dari decorator, atau pakai default
    const opts: RateLimitOptions =
      this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? RATE_LIMIT_DEFAULTS.global;

    // Identifier: pakai user id jika sudah auth, fallback ke IP
    const uid: string = (req as any).user?.uid ?? '';
    const ip          = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const prefix      = opts.keyPrefix ?? 'api';
    const identifier  = `${prefix}:${uid || ip}`;

    const { allowed, remaining, resetAt } = await this.redis.checkRateLimit(
      identifier,
      opts.limit,
      opts.windowSeconds,
    );

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit',     opts.limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset',     Math.floor(resetAt / 1000).toString());

    if (!allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Terlalu banyak request. Coba lagi dalam ${Math.ceil((resetAt - Date.now()) / 1000)} detik.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
