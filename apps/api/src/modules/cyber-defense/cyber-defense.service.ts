import { Injectable, Logger } from '@nestjs/common';

/* ── Types ─────────────────────────────────────────────────────────────── */
export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface ThreatEvent {
  id:         string;
  ip:         string;
  uid?:       string;
  type:       string;
  level:      ThreatLevel;
  detail:     string;
  detectedAt: Date;
  mitigated:  boolean;
}

export interface IpRecord {
  count:     number;
  firstSeen: number;
  blocked:   boolean;
  score:     number;   // 0–100 threat score
}

/* ── Patterns ──────────────────────────────────────────────────────────── */
const THREAT_PATTERNS: Array<{
  name:    string;
  level:   ThreatLevel;
  match:   (ctx: { path: string; body: string; ua: string; ip: string }) => boolean;
}> = [
  {
    name:  'sql_injection',
    level: 'critical',
    match: ({ path, body }) =>
      /('|--|union\s+select|drop\s+table|exec\s*\(|xp_cmdshell)/i.test(path + body),
  },
  {
    name:  'xss_attempt',
    level: 'high',
    match: ({ path, body }) =>
      /(<script|javascript:|onerror=|onload=|eval\()/i.test(path + body),
  },
  {
    name:  'path_traversal',
    level: 'high',
    match: ({ path }) => /(\.\.[/\\]){2,}/.test(path),
  },
  {
    name:  'suspicious_ua',
    level: 'medium',
    match: ({ ua }) =>
      !ua || /sqlmap|nikto|nmap|masscan|dirbuster|gobuster|wfuzz/i.test(ua),
  },
  {
    name:  'auth_brute_force',
    level: 'high',
    match: ({ path, ip }) =>
      /\/(login|auth|token)/.test(path),  // rate scored separately via IpRecord
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   CYBER DEFENSE SERVICE
   ══════════════════════════════════════════════════════════════════════════ */
@Injectable()
export class CyberDefenseService {
  private readonly logger = new Logger(CyberDefenseService.name);

  /** In-memory stores (upgrade ke Redis untuk production) */
  private readonly ipMap    = new Map<string, IpRecord>();
  private readonly events   : ThreatEvent[] = [];
  private readonly blocklist= new Set<string>();
  private eventIdCounter    = 0;

  /** Max events kept in memory */
  private readonly MAX_EVENTS = 500;
  /** Requests per minute before scoring as high threat */
  private readonly RATE_THRESHOLD = 60;
  /** Score threshold untuk auto-block */
  private readonly BLOCK_SCORE    = 80;

  /* ── Core: Analyze Request ─────────────────────────────────────────── */
  analyze(ctx: {
    ip:    string;
    path:  string;
    body:  string;
    ua:    string;
    uid?:  string;
    method: string;
  }): { blocked: boolean; threats: ThreatEvent[] } {
    const { ip } = ctx;
    const detected: ThreatEvent[] = [];

    // 1. Blocklist check
    if (this.blocklist.has(ip)) {
      return { blocked: true, threats: [] };
    }

    // 2. Rate tracking
    const rec = this.trackIp(ip);
    if (rec.score >= this.BLOCK_SCORE) {
      this.block(ip, 'score_threshold');
      return { blocked: true, threats: [] };
    }

    // 3. Pattern matching
    for (const pattern of THREAT_PATTERNS) {
      if (pattern.match(ctx)) {
        const event = this.createEvent({
          ip,
          uid:    ctx.uid,
          type:   pattern.name,
          level:  pattern.level,
          detail: `${ctx.method} ${ctx.path}`,
        });
        detected.push(event);
        rec.score = Math.min(100, rec.score + this.scoreIncrement(pattern.level));
      }
    }

    // 4. Adaptive response
    if (detected.length > 0) {
      this.adaptiveResponse(ip, rec, detected);
    }

    return {
      blocked: this.blocklist.has(ip),
      threats: detected,
    };
  }

  /* ── Adaptive Response ────────────────────────────────────────────── */
  private adaptiveResponse(ip: string, rec: IpRecord, threats: ThreatEvent[]) {
    const maxLevel = this.maxLevel(threats.map(t => t.level));

    switch (maxLevel) {
      case 'critical':
        this.block(ip, 'critical_threat_detected');
        break;
      case 'high':
        rec.score = Math.min(100, rec.score + 20);
        if (rec.score >= this.BLOCK_SCORE) this.block(ip, 'high_threat_accumulation');
        break;
      case 'medium':
        rec.score = Math.min(100, rec.score + 10);
        break;
      default:
        rec.score = Math.min(100, rec.score + 3);
    }

    this.logger.warn(
      `[CyberDefense] ip=${ip} score=${rec.score} threats=${threats.map(t => t.type).join(',')}`,
    );
  }

  /* ── IP Tracking ──────────────────────────────────────────────────── */
  private trackIp(ip: string): IpRecord {
    const now = Date.now();
    const rec  = this.ipMap.get(ip) ?? { count: 0, firstSeen: now, blocked: false, score: 0 };
    rec.count++;

    // Decay score every minute window
    const elapsed = (now - rec.firstSeen) / 1000;
    if (elapsed > 60) {
      rec.score    = Math.max(0, rec.score - 5);
      rec.firstSeen = now;
      rec.count     = 1;
    }

    // Rate score
    if (rec.count > this.RATE_THRESHOLD) {
      rec.score = Math.min(100, rec.score + 2);
    }

    this.ipMap.set(ip, rec);
    return rec;
  }

  /* ── Block IP ─────────────────────────────────────────────────────── */
  block(ip: string, reason: string) {
    this.blocklist.add(ip);
    const rec = this.ipMap.get(ip);
    if (rec) rec.blocked = true;
    this.createEvent({ ip, type: 'ip_blocked', level: 'critical', detail: reason });
    this.logger.error(`[CyberDefense] BLOCKED ip=${ip} reason=${reason}`);
  }

  unblock(ip: string) {
    this.blocklist.delete(ip);
    const rec = this.ipMap.get(ip);
    if (rec) { rec.blocked = false; rec.score = 0; }
    this.logger.log(`[CyberDefense] UNBLOCKED ip=${ip}`);
  }

  /* ── Real-Time Monitoring ─────────────────────────────────────────── */
  getMonitoringSnapshot() {
    const now  = Date.now();
    const last1m = this.events.filter(e => now - e.detectedAt.getTime() < 60_000);
    const last5m = this.events.filter(e => now - e.detectedAt.getTime() < 300_000);

    const byCritical = last5m.filter(e => e.level === 'critical').length;
    const byHigh     = last5m.filter(e => e.level === 'high').length;

    return {
      status:       byCritical > 0 ? 'ALERT' : byHigh > 2 ? 'WARNING' : 'NORMAL',
      blockedIPs:   this.blocklist.size,
      trackedIPs:   this.ipMap.size,
      events1m:     last1m.length,
      events5m:     last5m.length,
      recentThreats: last1m.slice(-10).reverse(),
      topThreats:   this.getTopThreats(last5m),
      blockList:    [...this.blocklist].slice(0, 20),
    };
  }

  getRecentEvents(limit = 50): ThreatEvent[] {
    return this.events.slice(-limit).reverse();
  }

  getIpInfo(ip: string) {
    return {
      ip,
      record:   this.ipMap.get(ip) ?? null,
      blocked:  this.blocklist.has(ip),
    };
  }

  /* ── Helpers ──────────────────────────────────────────────────────── */
  private createEvent(data: Omit<ThreatEvent, 'id' | 'detectedAt' | 'mitigated'>): ThreatEvent {
    const event: ThreatEvent = {
      id:         `evt_${++this.eventIdCounter}`,
      detectedAt: new Date(),
      mitigated:  data.level === 'critical' || data.type === 'ip_blocked',
      ...data,
    };
    this.events.push(event);
    if (this.events.length > this.MAX_EVENTS) this.events.shift();
    return event;
  }

  private scoreIncrement(level: ThreatLevel): number {
    return { none: 0, low: 5, medium: 10, high: 20, critical: 40 }[level] ?? 0;
  }

  private maxLevel(levels: ThreatLevel[]): ThreatLevel {
    const order: ThreatLevel[] = ['none', 'low', 'medium', 'high', 'critical'];
    return levels.reduce((max, l) =>
      order.indexOf(l) > order.indexOf(max) ? l : max, 'none');
  }

  private getTopThreats(events: ThreatEvent[]) {
    const counts: Record<string, number> = {};
    for (const e of events) counts[e.type] = (counts[e.type] || 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }
}
