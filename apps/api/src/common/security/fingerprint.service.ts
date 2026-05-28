import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

export interface FingerprintInput {
  ip: string;
  ja3: string;
  userAgent: string;
  acceptLang: string;
  acceptEncoding: string;
  accept: string;
}

/**
 * FingerprintService — Combined device fingerprint generator
 *
 * Fingerprint composition:
 *   IP entropy bucket | UA pattern | JA3 hash | Accept-header order
 *
 * Output: SHA-256 hex string (64 chars)
 *
 * This fingerprint DOES NOT identify individuals — it identifies
 * request behavioral patterns for anomaly detection.
 * Legal basis: security monitoring, not profiling.
 */
@Injectable()
export class FingerprintService {
  private readonly sessionSignatures = new Map<string, { sig: string; firstSeen: number; count: number }>();

  generate(input: FingerprintInput): string {
    const components = [
      this.normalizeIP(input.ip),
      this.normalizeUA(input.userAgent),
      input.ja3 !== 'unknown' ? input.ja3 : 'no-ja3',
      this.normalizeAccept(input.accept),
      this.normalizeAcceptLang(input.acceptLang),
      this.normalizeAcceptEncoding(input.acceptEncoding),
    ];

    return createHash('sha256')
      .update(components.join('|'))
      .digest('hex');
  }

  /**
   * Track session signature changes.
   * If same IP shows different device fingerprints within 60s = suspicious.
   */
  trackSession(ip: string, fingerprint: string): { changed: boolean; count: number } {
    const now = Date.now();
    const existing = this.sessionSignatures.get(ip);

    if (!existing) {
      this.sessionSignatures.set(ip, { sig: fingerprint, firstSeen: now, count: 1 });
      return { changed: false, count: 1 };
    }

    // Expire after 60 seconds
    if (now - existing.firstSeen > 60_000) {
      this.sessionSignatures.set(ip, { sig: fingerprint, firstSeen: now, count: 1 });
      return { changed: false, count: 1 };
    }

    const changed = existing.sig !== fingerprint;
    existing.count++;
    if (changed) existing.sig = fingerprint;

    return { changed, count: existing.count };
  }

  // ── Normalization helpers ───────────────────────────────────────────────────

  /** Convert IP to /24 subnet bucket (removes last octet for IPv4 entropy) */
  private normalizeIP(ip: string): string {
    if (ip.includes(':')) return 'ipv6'; // IPv6 — bucket as-is
    const parts = ip.split('.');
    if (parts.length !== 4) return 'unknown-ip';
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }

  /** Normalize User-Agent to browser family + OS family */
  private normalizeUA(ua: string): string {
    if (!ua || ua === 'unknown') return 'unknown-ua';

    let browser = 'other';
    if (/Chrome\//.test(ua) && !/Chromium|Edge/.test(ua)) browser = 'chrome';
    else if (/Firefox\//.test(ua)) browser = 'firefox';
    else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'safari';
    else if (/Edge\/|Edg\//.test(ua)) browser = 'edge';
    else if (/curl|wget|python|go-http|axios|node-fetch/i.test(ua)) browser = 'bot-tool';

    let os = 'other';
    if (/Windows/.test(ua)) os = 'windows';
    else if (/Macintosh/.test(ua)) os = 'mac';
    else if (/Linux/.test(ua)) os = 'linux';
    else if (/Android/.test(ua)) os = 'android';
    else if (/iPhone|iPad/.test(ua)) os = 'ios';

    return `${browser}-${os}`;
  }

  /** Normalize Accept header to ordered type list */
  private normalizeAccept(accept: string): string {
    if (!accept) return 'no-accept';
    return accept.split(',').map(t => t.trim().split(';')[0].trim()).sort().join(',');
  }

  /** Normalize Accept-Language to primary languages */
  private normalizeAcceptLang(lang: string): string {
    if (!lang) return 'no-lang';
    return lang.split(',').map(l => l.trim().split(';')[0].toLowerCase()).slice(0, 3).join(',');
  }

  /** Normalize Accept-Encoding to sorted list */
  private normalizeAcceptEncoding(enc: string): string {
    if (!enc) return 'no-enc';
    return enc.split(',').map(e => e.trim().split(';')[0].trim()).sort().join(',');
  }
}
