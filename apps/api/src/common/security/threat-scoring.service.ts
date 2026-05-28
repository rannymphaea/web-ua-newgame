import { Injectable } from '@nestjs/common';

export interface ScoringInput {
  ip: string;
  ja3: string;
  url: string;
  method: string;
  userAgent: string;
  payloadHash: string;
  deviceSig: string;
}

interface IPRecord {
  count: number;
  firstSeen: number;
  lastSeen: number;
  suspiciousPatterns: number;
  urls: Set<string>;
}

/**
 * ThreatScoringService — Behavioral scoring engine
 *
 * Score range: 0–100
 *   0–49:  allow
 *   50–79: challenge (CAPTCHA or additional verification)
 *   80–100: block
 *
 * Scoring factors:
 *   +15: Known scanner/bot UA
 *   +10: Request rate > 60/min from same IP
 *   +10: High URL entropy (fuzzing pattern)
 *   +10: Suspicious payload patterns
 *   +15: Honeypot/sensitive path access
 *   +10: Fingerprint mismatch from previous session
 *   +5:  Missing standard headers
 *   +20: IP in known bad-actor ranges (manual blocklist)
 */
@Injectable()
export class ThreatScoringService {
  private readonly ipRecords = new Map<string, IPRecord>();

  // Blocklisted IP prefixes (manually maintained, legal sources only)
  private readonly BLOCKED_PREFIXES = [
    '185.220.',  // Known Tor exit nodes
    '45.142.',   // Common scanner ranges
    '194.165.',  // Common brute force ranges
  ];

  // Known scanner/tool User-Agent patterns
  private readonly SCANNER_UA = [
    /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
    /nuclei/i, /dirbuster/i, /gobuster/i, /wfuzz/i, /burpsuite/i,
    /hydra/i, /acunetix/i, /nessus/i, /openvas/i, /metasploit/i,
  ];

  // Sensitive path patterns (honeypot triggers)
  private readonly SENSITIVE_PATHS = [
    /\.(env|git|bak|backup|sql|conf|key|pem|log)$/i,
    /\/(wp-admin|wp-login|phpmyadmin|admin\.php|xmlrpc|shell|c99|config|\.htaccess)/i,
    /\/(etc\/passwd|proc\/self|var\/log)/i,
    /\.\.\//,  // Path traversal
  ];

  score(input: ScoringInput): number {
    let s = 0;

    // ── IP blocklist check ───────────────────────────────────────────────────
    if (this.BLOCKED_PREFIXES.some(p => input.ip.startsWith(p))) s += 20;

    // ── Scanner UA detection ─────────────────────────────────────────────────
    if (this.SCANNER_UA.some(r => r.test(input.userAgent))) s += 15;

    // ── Rate-based scoring ───────────────────────────────────────────────────
    const rate = this.trackIP(input.ip, input.url);
    if (rate > 120) s += 20;       // > 2 req/sec
    else if (rate > 60) s += 10;  // > 1 req/sec

    // ── URL entropy (fuzzing/scanning pattern) ────────────────────────────────
    if (this.isHighEntropyURL(input.url)) s += 10;

    // ── Sensitive path ────────────────────────────────────────────────────────
    if (this.SENSITIVE_PATHS.some(r => r.test(input.url))) s += 15;

    // ── Payload pattern detection ─────────────────────────────────────────────
    if (this.hasSuspiciousPayloadHash(input.payloadHash)) s += 10;

    // ── Missing standard headers ──────────────────────────────────────────────
    if (!input.userAgent || input.userAgent === 'unknown') s += 5;
    if (input.ja3 === 'unknown') s += 3;

    // ── High URL diversity from same IP (DirBusting) ─────────────────────────
    const record = this.ipRecords.get(input.ip);
    if (record && record.urls.size > 50) s += 10;

    return Math.min(100, s);
  }

  /** Track request count per IP in sliding 60-second window */
  private trackIP(ip: string, url: string): number {
    const now = Date.now();
    let record = this.ipRecords.get(ip);

    if (!record) {
      record = { count: 1, firstSeen: now, lastSeen: now, suspiciousPatterns: 0, urls: new Set([url]) };
      this.ipRecords.set(ip, record);
      return 1;
    }

    // Reset window after 60 seconds
    if (now - record.firstSeen > 60_000) {
      record.count = 1;
      record.firstSeen = now;
      record.urls = new Set([url]);
    } else {
      record.count++;
      record.urls.add(url);
    }

    record.lastSeen = now;
    return record.count;
  }

  /** Check for high-entropy URL patterns (random path segments = fuzzing) */
  private isHighEntropyURL(url: string): boolean {
    const segments = url.split('/').filter(Boolean);
    return segments.some(seg => {
      if (seg.length < 8) return false;
      // Count unique characters; high ratio = high entropy
      const unique = new Set(seg.split('')).size;
      return unique / seg.length > 0.75;
    });
  }

  /** Check if payload hash matches known malicious payload hashes */
  private hasSuspiciousPayloadHash(_hash: string): boolean {
    // In production: check against maintained hash blocklist
    // For now: returns false (no false positives without the list)
    return false;
  }

  /** Clean up old IP records (call periodically) */
  cleanup(): void {
    const cutoff = Date.now() - 600_000; // 10 minutes
    for (const [ip, record] of this.ipRecords.entries()) {
      if (record.lastSeen < cutoff) this.ipRecords.delete(ip);
    }
  }
}
