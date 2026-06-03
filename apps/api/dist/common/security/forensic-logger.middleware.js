"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForensicLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let ForensicLoggerMiddleware = class ForensicLoggerMiddleware {
    constructor() {
        this.sequences = new Map();
        this.SUSPICIOUS_SEQUENCES = [
            ['/api/users', '/api/admin', '/api/logs'],
            ['/api/auth/login', '/api/auth/login', '/api/auth/login'],
            ['/api/members', '/api/export'],
        ];
        this.QUERY_TAMPER_PATTERNS = [
            /['";]|--|\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b/i,
            /%27|%22|%3B|%2D%2D/i,
            /\bEXEC\b|\bSP_\w+/i,
        ];
        this.apiKeyUsage = new Map();
    }
    use(req, res, next) {
        const ip = req.headers['x-real-ip'] || req.ip || 'unknown';
        const apiKey = req.headers.authorization?.replace('Bearer ', '') || '';
        const apiKeyHash = apiKey ? (0, crypto_1.createHash)('sha256').update(apiKey).digest('hex').slice(0, 16) : 'none';
        const queryStr = JSON.stringify(req.query);
        const queryTampered = this.QUERY_TAMPER_PATTERNS.some(r => r.test(queryStr));
        if (queryTampered) {
            this.logForensic('QUERY_TAMPER', ip, req, { query: queryStr, api_key_hash: apiKeyHash });
        }
        this.trackApiKey(apiKeyHash, ip, req.path);
        const sequenceKey = `${ip}:${apiKeyHash}`;
        this.trackSequence(sequenceKey, req.path);
        const suspicious = this.checkSuspiciousSequence(sequenceKey);
        if (suspicious) {
            this.logForensic('SUSPICIOUS_SEQUENCE', ip, req, {
                sequence: this.sequences.get(sequenceKey)?.endpoints.slice(-5),
                api_key_hash: apiKeyHash,
            });
        }
        const multerFile = req.file;
        const multerFiles = req.files;
        if (multerFile || (multerFiles && Object.keys(multerFiles).length > 0)) {
            const files = multerFile
                ? [multerFile]
                : Array.isArray(multerFiles)
                    ? multerFiles
                    : Object.values(multerFiles).flat();
            files.forEach((f) => {
                const fileHash = (0, crypto_1.createHash)('sha256').update(f.buffer || Buffer.alloc(0)).digest('hex');
                this.logForensic('FILE_UPLOAD', ip, req, {
                    filename: f.originalname,
                    mimetype: f.mimetype,
                    size: f.size,
                    sha256: fileHash,
                    api_key_hash: apiKeyHash,
                });
            });
        }
        next();
    }
    trackApiKey(keyHash, ip, path) {
        if (keyHash === 'none')
            return;
        const now = Date.now();
        let record = this.apiKeyUsage.get(keyHash);
        if (!record) {
            record = { count: 1, ips: new Set([ip]), firstSeen: now };
            this.apiKeyUsage.set(keyHash, record);
            return;
        }
        if (now - record.firstSeen > 3_600_000) {
            record.count = 1;
            record.ips = new Set([ip]);
            record.firstSeen = now;
            return;
        }
        record.count++;
        record.ips.add(ip);
        if (record.count > 500 || record.ips.size > 5) {
            this.logForensic('API_KEY_ABUSE', ip, { method: 'SYSTEM', path, originalUrl: path, headers: {} }, {
                api_key_hash: keyHash,
                request_count: record.count,
                unique_ips: record.ips.size,
            });
        }
    }
    trackSequence(key, endpoint) {
        let seq = this.sequences.get(key);
        const now = Date.now();
        if (!seq) {
            seq = { endpoints: [endpoint], timestamps: [now] };
            this.sequences.set(key, seq);
            return;
        }
        seq.endpoints = [...seq.endpoints.slice(-19), endpoint];
        seq.timestamps = [...seq.timestamps.slice(-19), now];
        while (seq.timestamps.length > 0 && now - seq.timestamps[0] > 300_000) {
            seq.endpoints.shift();
            seq.timestamps.shift();
        }
    }
    checkSuspiciousSequence(key) {
        const seq = this.sequences.get(key);
        if (!seq || seq.endpoints.length < 2)
            return false;
        return this.SUSPICIOUS_SEQUENCES.some(pattern => {
            const patLen = pattern.length;
            const recent = seq.endpoints.slice(-patLen);
            return recent.length === patLen && pattern.every((ep, i) => recent[i]?.includes(ep));
        });
    }
    logForensic(event, ip, req, extra) {
        const entry = {
            type: `FORENSIC_${event}`,
            timestamp: new Date().toISOString(),
            ip,
            method: req.method,
            path: req.path,
            request_id: req.headers['x-request-id'] || 'unknown',
            ...extra,
        };
        process.stdout.write(JSON.stringify(entry) + '\n');
    }
};
exports.ForensicLoggerMiddleware = ForensicLoggerMiddleware;
exports.ForensicLoggerMiddleware = ForensicLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], ForensicLoggerMiddleware);
//# sourceMappingURL=forensic-logger.middleware.js.map