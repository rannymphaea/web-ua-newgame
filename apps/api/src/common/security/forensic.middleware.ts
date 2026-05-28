import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash, randomUUID } from 'crypto';
import { FingerprintService } from './fingerprint.service';
import { ThreatScoringService } from './threat-scoring.service';

/**
 * ForensicMiddleware — Per-request tracker
 * Generates fingerprint, threat score, and structured forensic log.
 *
 * Output log fields:
 *   timestamp | request_id | ip | ja3 | url | method
 *   payload_hash | device_signature | score | action
 *   geo_country | asn | user_agent | accept_language
 */
export interface ForensicLog {
  timestamp: string;          // RFC3339
  request_id: string;         // UUIDv7 (fallback: UUIDv4)
  ip: string;
  ja3: string;
  url: string;
  method: string;
  payload_hash: string;       // SHA-256 of request body (empty string if no body)
  device_signature: string;   // SHA-256 composite fingerprint
  score: number;              // 0–100 threat score
  action: 'allow' | 'challenge' | 'block';
  geo_country: string;
  geo_city: string;
  asn: string;
  asn_org: string;
  user_agent: string;
  accept_language: string;
  status_code?: number;
  response_time_ms?: number;
}

@Injectable()
export class ForensicMiddleware implements NestMiddleware {
  constructor(
    private readonly fingerprint: FingerprintService,
    private readonly threatScoring: ThreatScoringService,
  ) {}

  use(req: Request & { forensic?: ForensicLog }, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // ── Request ID (UUIDv7 fallback: nginx-injected or generate own) ────────
    const requestId = (req.headers['x-request-id'] as string) || this.generateRequestId();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);

    // ── Extract metadata from nginx-forwarded headers ────────────────────────
    const ip          = (req.headers['x-real-ip'] as string) || req.ip || 'unknown';
    const ja3         = (req.headers['x-ja3-fingerprint'] as string) || 'unknown';
    const geoCountry  = (req.headers['x-geoip-country'] as string) || 'unknown';
    const geoCity     = (req.headers['x-geoip-city'] as string) || 'unknown';
    const asn         = (req.headers['x-asn'] as string) || 'unknown';
    const asnOrg      = (req.headers['x-asn-org'] as string) || 'unknown';
    const userAgent   = req.headers['user-agent'] || 'unknown';
    const acceptLang  = (req.headers['accept-language'] as string) || 'unknown';

    // ── Payload hash ─────────────────────────────────────────────────────────
    const bodyStr    = req.body ? JSON.stringify(req.body) : '';
    const payloadHash = createHash('sha256').update(bodyStr).digest('hex');

    // ── Device fingerprint ────────────────────────────────────────────────────
    const deviceSig = this.fingerprint.generate({
      ip, ja3, userAgent,
      acceptLang,
      acceptEncoding: (req.headers['accept-encoding'] as string) || '',
      accept: (req.headers['accept'] as string) || '',
    });

    // ── Threat score ──────────────────────────────────────────────────────────
    const score = this.threatScoring.score({
      ip, ja3, url: req.originalUrl, method: req.method,
      userAgent, payloadHash, deviceSig,
    });

    // ── Action decision ───────────────────────────────────────────────────────
    let action: ForensicLog['action'] = 'allow';
    if (score >= 80) action = 'block';
    else if (score >= 50) action = 'challenge';

    // ── Build forensic log entry ──────────────────────────────────────────────
    const log: ForensicLog = {
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

    // ── Block immediately if score >= 80 ─────────────────────────────────────
    if (action === 'block') {
      res.status(403).json({ error: 'Forbidden', code: 'THREAT_BLOCKED' });
      this.emitLog({ ...log, status_code: 403, response_time_ms: Date.now() - startTime });
      return;
    }

    // ── Log on response finish ────────────────────────────────────────────────
    res.on('finish', () => {
      this.emitLog({
        ...log,
        status_code: res.statusCode,
        response_time_ms: Date.now() - startTime,
      });
    });

    next();
  }

  private generateRequestId(): string {
    // Simple UUIDv4 — replace with UUIDv7 library in production
    return randomUUID();
  }

  private emitLog(log: ForensicLog & { status_code?: number; response_time_ms?: number }): void {
    // Emit as structured JSON to stdout (picked up by SIEM/ELK/Loki)
    process.stdout.write(JSON.stringify({ type: 'FORENSIC_REQUEST', ...log }) + '\n');
  }
}
