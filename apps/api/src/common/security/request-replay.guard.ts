import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createHash } from 'crypto';
import { Request } from 'express';

interface NonceRecord {
  hash: string;
  timestamp: number;
}

/**
 * RequestReplayGuard — Prevents request replay attacks
 *
 * Strategy:
 *   1. Client sends X-Request-Nonce header (random UUID per request)
 *   2. Client sends X-Request-Timestamp header (Unix ms)
 *   3. Guard rejects if:
 *      - Timestamp is outside ±300 second window (clock skew protection)
 *      - Nonce was already seen within the window (replay detection)
 *      - Body hash matches a previously seen body hash from same IP
 *
 * Apply to sensitive mutation endpoints:
 *   @UseGuards(RequestReplayGuard)
 */
@Injectable()
export class RequestReplayGuard implements CanActivate {
  // Nonce store: nonce_hash → timestamp
  private readonly nonceStore = new Map<string, NonceRecord>();
  // Body hash store: body_hash → { ip, timestamp }
  private readonly bodyStore = new Map<string, { ip: string; timestamp: number }>();

  private readonly WINDOW_SECONDS = 300; // 5-minute replay window

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    // Only check state-mutating methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;

    const nonce     = req.headers['x-request-nonce'] as string;
    const tsHeader  = req.headers['x-request-timestamp'] as string;
    const ip        = (req.headers['x-real-ip'] as string) || req.ip || 'unknown';

    // ── Timestamp validation ──────────────────────────────────────────────
    if (tsHeader) {
      const ts = parseInt(tsHeader, 10);
      const now = Date.now();
      const diffSeconds = Math.abs(now - ts) / 1000;

      if (diffSeconds > this.WINDOW_SECONDS) {
        this.logReplay('TIMESTAMP_EXPIRED', ip, req, { timestamp: tsHeader, diff_seconds: diffSeconds });
        throw new ForbiddenException('Request timestamp expired');
      }
    }

    // ── Nonce replay detection ────────────────────────────────────────────
    if (nonce) {
      const nonceHash = createHash('sha256').update(nonce).digest('hex');
      const existing  = this.nonceStore.get(nonceHash);

      if (existing) {
        this.logReplay('NONCE_REPLAY', ip, req, { nonce_hash: nonceHash });
        throw new ForbiddenException('Request replay detected');
      }

      // Store nonce
      this.nonceStore.set(nonceHash, { hash: nonceHash, timestamp: Date.now() });
      this.cleanupNonces();
    }

    // ── Body hash replay detection ────────────────────────────────────────
    const bodyStr  = req.body ? JSON.stringify(req.body) : '';
    const bodyHash = createHash('sha256').update(`${ip}:${bodyStr}`).digest('hex');
    const existingBody = this.bodyStore.get(bodyHash);

    if (existingBody) {
      const ageSec = (Date.now() - existingBody.timestamp) / 1000;
      if (ageSec < 30 && existingBody.ip === ip) {
        // Same body from same IP within 30 seconds = replay
        this.logReplay('BODY_REPLAY', ip, req, { body_hash: bodyHash, age_seconds: ageSec });
        throw new ForbiddenException('Duplicate request detected');
      }
    }

    this.bodyStore.set(bodyHash, { ip, timestamp: Date.now() });

    return true;
  }

  /** Remove expired nonces from store */
  private cleanupNonces(): void {
    const cutoff = Date.now() - this.WINDOW_SECONDS * 1000;
    for (const [key, record] of this.nonceStore.entries()) {
      if (record.timestamp < cutoff) this.nonceStore.delete(key);
    }
    // Also clean body store (30 second window)
    const bodyCutoff = Date.now() - 30_000;
    for (const [key, record] of this.bodyStore.entries()) {
      if (record.timestamp < bodyCutoff) this.bodyStore.delete(key);
    }
  }

  private logReplay(event: string, ip: string, req: Request, extra: Record<string, unknown>): void {
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
}
