"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FingerprintService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let FingerprintService = class FingerprintService {
    constructor() {
        this.sessionSignatures = new Map();
    }
    generate(input) {
        const components = [
            this.normalizeIP(input.ip),
            this.normalizeUA(input.userAgent),
            input.ja3 !== 'unknown' ? input.ja3 : 'no-ja3',
            this.normalizeAccept(input.accept),
            this.normalizeAcceptLang(input.acceptLang),
            this.normalizeAcceptEncoding(input.acceptEncoding),
        ];
        return (0, crypto_1.createHash)('sha256')
            .update(components.join('|'))
            .digest('hex');
    }
    trackSession(ip, fingerprint) {
        const now = Date.now();
        const existing = this.sessionSignatures.get(ip);
        if (!existing) {
            this.sessionSignatures.set(ip, { sig: fingerprint, firstSeen: now, count: 1 });
            return { changed: false, count: 1 };
        }
        if (now - existing.firstSeen > 60_000) {
            this.sessionSignatures.set(ip, { sig: fingerprint, firstSeen: now, count: 1 });
            return { changed: false, count: 1 };
        }
        const changed = existing.sig !== fingerprint;
        existing.count++;
        if (changed)
            existing.sig = fingerprint;
        return { changed, count: existing.count };
    }
    normalizeIP(ip) {
        if (ip.includes(':'))
            return 'ipv6';
        const parts = ip.split('.');
        if (parts.length !== 4)
            return 'unknown-ip';
        return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
    }
    normalizeUA(ua) {
        if (!ua || ua === 'unknown')
            return 'unknown-ua';
        let browser = 'other';
        if (/Chrome\//.test(ua) && !/Chromium|Edge/.test(ua))
            browser = 'chrome';
        else if (/Firefox\//.test(ua))
            browser = 'firefox';
        else if (/Safari\//.test(ua) && !/Chrome/.test(ua))
            browser = 'safari';
        else if (/Edge\/|Edg\//.test(ua))
            browser = 'edge';
        else if (/curl|wget|python|go-http|axios|node-fetch/i.test(ua))
            browser = 'bot-tool';
        let os = 'other';
        if (/Windows/.test(ua))
            os = 'windows';
        else if (/Macintosh/.test(ua))
            os = 'mac';
        else if (/Linux/.test(ua))
            os = 'linux';
        else if (/Android/.test(ua))
            os = 'android';
        else if (/iPhone|iPad/.test(ua))
            os = 'ios';
        return `${browser}-${os}`;
    }
    normalizeAccept(accept) {
        if (!accept)
            return 'no-accept';
        return accept.split(',').map(t => t.trim().split(';')[0].trim()).sort().join(',');
    }
    normalizeAcceptLang(lang) {
        if (!lang)
            return 'no-lang';
        return lang.split(',').map(l => l.trim().split(';')[0].toLowerCase()).slice(0, 3).join(',');
    }
    normalizeAcceptEncoding(enc) {
        if (!enc)
            return 'no-enc';
        return enc.split(',').map(e => e.trim().split(';')[0].trim()).sort().join(',');
    }
};
exports.FingerprintService = FingerprintService;
exports.FingerprintService = FingerprintService = __decorate([
    (0, common_1.Injectable)()
], FingerprintService);
//# sourceMappingURL=fingerprint.service.js.map