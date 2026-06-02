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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = exports.RATE_LIMIT_DEFAULTS = exports.RATE_LIMIT_KEY = void 0;
exports.RateLimit = RateLimit;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const redis_service_1 = require("../redis/redis.service");
exports.RATE_LIMIT_KEY = 'rate_limit';
function RateLimit(opts) {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(exports.RATE_LIMIT_KEY, opts, descriptor?.value ?? target);
        return descriptor;
    };
}
exports.RATE_LIMIT_DEFAULTS = {
    auth: { limit: 10, windowSeconds: 900 },
    write: { limit: 60, windowSeconds: 60 },
    read: { limit: 300, windowSeconds: 60 },
    global: { limit: 100, windowSeconds: 60 },
};
let RateLimitGuard = class RateLimitGuard {
    constructor(reflector, redis) {
        this.reflector = reflector;
        this.redis = redis;
    }
    async canActivate(context) {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const opts = this.reflector.getAllAndOverride(exports.RATE_LIMIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? exports.RATE_LIMIT_DEFAULTS.global;
        const uid = req.user?.uid ?? '';
        const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
        const prefix = opts.keyPrefix ?? 'api';
        const identifier = `${prefix}:${uid || ip}`;
        const { allowed, remaining, resetAt } = await this.redis.checkRateLimit(identifier, opts.limit, opts.windowSeconds);
        res.setHeader('X-RateLimit-Limit', opts.limit.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', Math.floor(resetAt / 1000).toString());
        if (!allowed) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                message: `Terlalu banyak request. Coba lagi dalam ${Math.ceil((resetAt - Date.now()) / 1000)} detik.`,
                error: 'Too Many Requests',
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        redis_service_1.RedisService])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map