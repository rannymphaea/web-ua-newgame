"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CyberDefenseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberDefenseService = void 0;
const common_1 = require("@nestjs/common");
const THREAT_PATTERNS = [
    {
        name: 'sql_injection',
        level: 'critical',
        match: ({ path, body }) => /('|--|union\s+select|drop\s+table|exec\s*\(|xp_cmdshell)/i.test(path + body),
    },
    {
        name: 'xss_attempt',
        level: 'high',
        match: ({ path, body }) => /(<script|javascript:|onerror=|onload=|eval\()/i.test(path + body),
    },
    {
        name: 'path_traversal',
        level: 'high',
        match: ({ path }) => /(\.\.[/\\]){2,}/.test(path),
    },
    {
        name: 'suspicious_ua',
        level: 'medium',
        match: ({ ua }) => !ua || /sqlmap|nikto|nmap|masscan|dirbuster|gobuster|wfuzz/i.test(ua),
    },
    {
        name: 'auth_brute_force',
        level: 'high',
        match: ({ path, ip }) => /\/(login|auth|token)/.test(path),
    },
];
let CyberDefenseService = CyberDefenseService_1 = class CyberDefenseService {
    constructor() {
        this.logger = new common_1.Logger(CyberDefenseService_1.name);
        this.ipMap = new Map();
        this.events = [];
        this.blocklist = new Set();
        this.eventIdCounter = 0;
        this.MAX_EVENTS = 500;
        this.RATE_THRESHOLD = 60;
        this.BLOCK_SCORE = 80;
    }
    analyze(ctx) {
        const { ip } = ctx;
        const detected = [];
        if (this.blocklist.has(ip)) {
            return { blocked: true, threats: [] };
        }
        const rec = this.trackIp(ip);
        if (rec.score >= this.BLOCK_SCORE) {
            this.block(ip, 'score_threshold');
            return { blocked: true, threats: [] };
        }
        for (const pattern of THREAT_PATTERNS) {
            if (pattern.match(ctx)) {
                const event = this.createEvent({
                    ip,
                    uid: ctx.uid,
                    type: pattern.name,
                    level: pattern.level,
                    detail: `${ctx.method} ${ctx.path}`,
                });
                detected.push(event);
                rec.score = Math.min(100, rec.score + this.scoreIncrement(pattern.level));
            }
        }
        if (detected.length > 0) {
            this.adaptiveResponse(ip, rec, detected);
        }
        return {
            blocked: this.blocklist.has(ip),
            threats: detected,
        };
    }
    adaptiveResponse(ip, rec, threats) {
        const maxLevel = this.maxLevel(threats.map(t => t.level));
        switch (maxLevel) {
            case 'critical':
                this.block(ip, 'critical_threat_detected');
                break;
            case 'high':
                rec.score = Math.min(100, rec.score + 20);
                if (rec.score >= this.BLOCK_SCORE)
                    this.block(ip, 'high_threat_accumulation');
                break;
            case 'medium':
                rec.score = Math.min(100, rec.score + 10);
                break;
            default:
                rec.score = Math.min(100, rec.score + 3);
        }
        this.logger.warn(`[CyberDefense] ip=${ip} score=${rec.score} threats=${threats.map(t => t.type).join(',')}`);
    }
    trackIp(ip) {
        const now = Date.now();
        const rec = this.ipMap.get(ip) ?? { count: 0, firstSeen: now, blocked: false, score: 0 };
        rec.count++;
        const elapsed = (now - rec.firstSeen) / 1000;
        if (elapsed > 60) {
            rec.score = Math.max(0, rec.score - 5);
            rec.firstSeen = now;
            rec.count = 1;
        }
        if (rec.count > this.RATE_THRESHOLD) {
            rec.score = Math.min(100, rec.score + 2);
        }
        this.ipMap.set(ip, rec);
        return rec;
    }
    block(ip, reason) {
        this.blocklist.add(ip);
        const rec = this.ipMap.get(ip);
        if (rec)
            rec.blocked = true;
        this.createEvent({ ip, type: 'ip_blocked', level: 'critical', detail: reason });
        this.logger.error(`[CyberDefense] BLOCKED ip=${ip} reason=${reason}`);
    }
    unblock(ip) {
        this.blocklist.delete(ip);
        const rec = this.ipMap.get(ip);
        if (rec) {
            rec.blocked = false;
            rec.score = 0;
        }
        this.logger.log(`[CyberDefense] UNBLOCKED ip=${ip}`);
    }
    getMonitoringSnapshot() {
        const now = Date.now();
        const last1m = this.events.filter(e => now - e.detectedAt.getTime() < 60_000);
        const last5m = this.events.filter(e => now - e.detectedAt.getTime() < 300_000);
        const byCritical = last5m.filter(e => e.level === 'critical').length;
        const byHigh = last5m.filter(e => e.level === 'high').length;
        return {
            status: byCritical > 0 ? 'ALERT' : byHigh > 2 ? 'WARNING' : 'NORMAL',
            blockedIPs: this.blocklist.size,
            trackedIPs: this.ipMap.size,
            events1m: last1m.length,
            events5m: last5m.length,
            recentThreats: last1m.slice(-10).reverse(),
            topThreats: this.getTopThreats(last5m),
            blockList: [...this.blocklist].slice(0, 20),
        };
    }
    getRecentEvents(limit = 50) {
        return this.events.slice(-limit).reverse();
    }
    getIpInfo(ip) {
        return {
            ip,
            record: this.ipMap.get(ip) ?? null,
            blocked: this.blocklist.has(ip),
        };
    }
    createEvent(data) {
        const event = {
            id: `evt_${++this.eventIdCounter}`,
            detectedAt: new Date(),
            mitigated: data.level === 'critical' || data.type === 'ip_blocked',
            ...data,
        };
        this.events.push(event);
        if (this.events.length > this.MAX_EVENTS)
            this.events.shift();
        return event;
    }
    scoreIncrement(level) {
        return { none: 0, low: 5, medium: 10, high: 20, critical: 40 }[level] ?? 0;
    }
    maxLevel(levels) {
        const order = ['none', 'low', 'medium', 'high', 'critical'];
        return levels.reduce((max, l) => order.indexOf(l) > order.indexOf(max) ? l : max, 'none');
    }
    getTopThreats(events) {
        const counts = {};
        for (const e of events)
            counts[e.type] = (counts[e.type] || 0) + 1;
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
    }
};
exports.CyberDefenseService = CyberDefenseService;
exports.CyberDefenseService = CyberDefenseService = CyberDefenseService_1 = __decorate([
    (0, common_1.Injectable)()
], CyberDefenseService);
//# sourceMappingURL=cyber-defense.service.js.map