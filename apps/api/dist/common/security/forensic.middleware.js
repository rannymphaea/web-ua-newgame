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
exports.ForensicMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const fingerprint_service_1 = require("./fingerprint.service");
const threat_scoring_service_1 = require("./threat-scoring.service");
let ForensicMiddleware = class ForensicMiddleware {
    constructor(fingerprint, threatScoring) {
        this.fingerprint = fingerprint;
        this.threatScoring = threatScoring;
    }
    use(req, res, next) {
        const startTime = Date.now();
        const requestId = req.headers['x-request-id'] || this.generateRequestId();
        req.headers['x-request-id'] = requestId;
        res.setHeader('X-Request-ID', requestId);
        const ip = req.headers['x-real-ip'] || req.ip || 'unknown';
        const ja3 = req.headers['x-ja3-fingerprint'] || 'unknown';
        const geoCountry = req.headers['x-geoip-country'] || 'unknown';
        const geoCity = req.headers['x-geoip-city'] || 'unknown';
        const asn = req.headers['x-asn'] || 'unknown';
        const asnOrg = req.headers['x-asn-org'] || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        const acceptLang = req.headers['accept-language'] || 'unknown';
        const bodyStr = req.body ? JSON.stringify(req.body) : '';
        const payloadHash = (0, crypto_1.createHash)('sha256').update(bodyStr).digest('hex');
        const deviceSig = this.fingerprint.generate({
            ip, ja3, userAgent,
            acceptLang,
            acceptEncoding: req.headers['accept-encoding'] || '',
            accept: req.headers['accept'] || '',
        });
        const score = this.threatScoring.score({
            ip, ja3, url: req.originalUrl, method: req.method,
            userAgent, payloadHash, deviceSig,
        });
        let action = 'allow';
        if (score >= 80)
            action = 'block';
        else if (score >= 50)
            action = 'challenge';
        const log = {
            timestamp: new Date().toISOString(),
            request_id: requestId,
            ip, ja3,
            url: req.originalUrl,
            method: req.method,
            payload_hash: payloadHash,
            device_signature: deviceSig,
            score,
            action,
            geo_country: geoCountry,
            geo_city: geoCity,
            asn, asn_org: asnOrg,
            user_agent: userAgent,
            accept_language: acceptLang,
        };
        req.forensic = log;
        if (action === 'block') {
            res.status(403).json({ error: 'Forbidden', code: 'THREAT_BLOCKED' });
            this.emitLog({ ...log, status_code: 403, response_time_ms: Date.now() - startTime });
            return;
        }
        res.on('finish', () => {
            this.emitLog({
                ...log,
                status_code: res.statusCode,
                response_time_ms: Date.now() - startTime,
            });
        });
        next();
    }
    generateRequestId() {
        return (0, crypto_1.randomUUID)();
    }
    emitLog(log) {
        process.stdout.write(JSON.stringify({ type: 'FORENSIC_REQUEST', ...log }) + '\n');
    }
};
exports.ForensicMiddleware = ForensicMiddleware;
exports.ForensicMiddleware = ForensicMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fingerprint_service_1.FingerprintService,
        threat_scoring_service_1.ThreatScoringService])
], ForensicMiddleware);
//# sourceMappingURL=forensic.middleware.js.map