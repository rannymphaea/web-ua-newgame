"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreatScoringService = void 0;
const common_1 = require("@nestjs/common");
let ThreatScoringService = class ThreatScoringService {
    constructor() {
        this.ipRecords = new Map();
        this.BLOCKED_PREFIXES = [
            '185.220.',
            '45.142.',
            '194.165.',
        ];
        this.SCANNER_UA = [
            /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
            /nuclei/i, /dirbuster/i, /gobuster/i, /wfuzz/i, /burpsuite/i,
            /hydra/i, /acunetix/i, /nessus/i, /openvas/i, /metasploit/i,
        ];
        this.SENSITIVE_PATHS = [
            /\.(env|git|bak|backup|sql|conf|key|pem|log)$/i,
            /\/(wp-admin|wp-login|phpmyadmin|admin\.php|xmlrpc|shell|c99|config|\.htaccess)/i,
            /\/(etc\/passwd|proc\/self|var\/log)/i,
            /\.\.\//,
        ];
    }
    score(input) {
        let s = 0;
        if (this.BLOCKED_PREFIXES.some(p => input.ip.startsWith(p)))
            s += 20;
        if (this.SCANNER_UA.some(r => r.test(input.userAgent)))
            s += 15;
        const rate = this.trackIP(input.ip, input.url);
        if (rate > 120)
            s += 20;
        else if (rate > 60)
            s += 10;
        if (this.isHighEntropyURL(input.url))
            s += 10;
        if (this.SENSITIVE_PATHS.some(r => r.test(input.url)))
            s += 15;
        if (this.hasSuspiciousPayloadHash(input.payloadHash))
            s += 10;
        if (!input.userAgent || input.userAgent === 'unknown')
            s += 5;
        if (input.ja3 === 'unknown')
            s += 3;
        const record = this.ipRecords.get(input.ip);
        if (record && record.urls.size > 50)
            s += 10;
        return Math.min(100, s);
    }
    trackIP(ip, url) {
        const now = Date.now();
        let record = this.ipRecords.get(ip);
        if (!record) {
            record = { count: 1, firstSeen: now, lastSeen: now, suspiciousPatterns: 0, urls: new Set([url]) };
            this.ipRecords.set(ip, record);
            return 1;
        }
        if (now - record.firstSeen > 60_000) {
            record.count = 1;
            record.firstSeen = now;
            record.urls = new Set([url]);
        }
        else {
            record.count++;
            record.urls.add(url);
        }
        record.lastSeen = now;
        return record.count;
    }
    isHighEntropyURL(url) {
        const segments = url.split('/').filter(Boolean);
        return segments.some(seg => {
            if (seg.length < 8)
                return false;
            const unique = new Set(seg.split('')).size;
            return unique / seg.length > 0.75;
        });
    }
    hasSuspiciousPayloadHash(_hash) {
        return false;
    }
    cleanup() {
        const cutoff = Date.now() - 600_000;
        for (const [ip, record] of this.ipRecords.entries()) {
            if (record.lastSeen < cutoff)
                this.ipRecords.delete(ip);
        }
    }
};
exports.ThreatScoringService = ThreatScoringService;
exports.ThreatScoringService = ThreatScoringService = __decorate([
    (0, common_1.Injectable)()
], ThreatScoringService);
//# sourceMappingURL=threat-scoring.service.js.map