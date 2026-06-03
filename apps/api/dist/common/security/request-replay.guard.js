"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestReplayGuard = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let RequestReplayGuard = class RequestReplayGuard {
    constructor() {
        this.nonceStore = new Map();
        this.bodyStore = new Map();
        this.WINDOW_SECONDS = 300;
    }
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method))
            return true;
        const nonce = req.headers['x-request-nonce'];
        const tsHeader = req.headers['x-request-timestamp'];
        const ip = req.headers['x-real-ip'] || req.ip || 'unknown';
        if (tsHeader) {
            const ts = parseInt(tsHeader, 10);
            const now = Date.now();
            const diffSeconds = Math.abs(now - ts) / 1000;
            if (diffSeconds > this.WINDOW_SECONDS) {
                this.logReplay('TIMESTAMP_EXPIRED', ip, req, { timestamp: tsHeader, diff_seconds: diffSeconds });
                throw new common_1.ForbiddenException('Request timestamp expired');
            }
        }
        if (nonce) {
            const nonceHash = (0, crypto_1.createHash)('sha256').update(nonce).digest('hex');
            const existing = this.nonceStore.get(nonceHash);
            if (existing) {
                this.logReplay('NONCE_REPLAY', ip, req, { nonce_hash: nonceHash });
                throw new common_1.ForbiddenException('Request replay detected');
            }
            this.nonceStore.set(nonceHash, { hash: nonceHash, timestamp: Date.now() });
            this.cleanupNonces();
        }
        const bodyStr = req.body ? JSON.stringify(req.body) : '';
        const bodyHash = (0, crypto_1.createHash)('sha256').update(`${ip}:${bodyStr}`).digest('hex');
        const existingBody = this.bodyStore.get(bodyHash);
        if (existingBody) {
            const ageSec = (Date.now() - existingBody.timestamp) / 1000;
            if (ageSec < 30 && existingBody.ip === ip) {
                this.logReplay('BODY_REPLAY', ip, req, { body_hash: bodyHash, age_seconds: ageSec });
                throw new common_1.ForbiddenException('Duplicate request detected');
            }
        }
        this.bodyStore.set(bodyHash, { ip, timestamp: Date.now() });
        return true;
    }
    cleanupNonces() {
        const cutoff = Date.now() - this.WINDOW_SECONDS * 1000;
        for (const [key, record] of this.nonceStore.entries()) {
            if (record.timestamp < cutoff)
                this.nonceStore.delete(key);
        }
        const bodyCutoff = Date.now() - 30_000;
        for (const [key, record] of this.bodyStore.entries()) {
            if (record.timestamp < bodyCutoff)
                this.bodyStore.delete(key);
        }
    }
    logReplay(event, ip, req, extra) {
        process.stdout.write(JSON.stringify({
            type: `SECURITY_${event}`,
            timestamp: new Date().toISOString(),
            ip,
            method: req.method,
            path: req.path,
            request_id: req.headers['x-request-id'] || 'unknown',
            ...extra,
        }) + '\n');
    }
};
exports.RequestReplayGuard = RequestReplayGuard;
exports.RequestReplayGuard = RequestReplayGuard = __decorate([
    (0, common_1.Injectable)()
], RequestReplayGuard);
//# sourceMappingURL=request-replay.guard.js.map