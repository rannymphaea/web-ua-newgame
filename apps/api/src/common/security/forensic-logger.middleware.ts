import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
}

type RequestWithFiles = Request & {
  file?: MulterFile;
  files?: MulterFile[] | Record<string, MulterFile[]>;
};

interface RequestSequence {
  endpoints: string[];
  timestamps: number[];
  apiKeyHash?: string;
}

/**
 * ForensicLoggerMiddleware — NestJS forensic activity logging
 *
 * Capabilities:
 *   - Activity log level: forensic (every request with full context)
 *   - API key abuse detector
 *   - Suspicious endpoint sequence tracker
 *   - Query tampering detection
 *   - File upload SHA-256 logging
 */
@Injectable()
export class ForensicLoggerMiddleware implements NestMiddleware {
  private readonly sequences = new Map<string, RequestSequence>();

  // Suspicious endpoint sequences (in order)
  private readonly SUSPICIOUS_SEQUENCES = [
    ['/api/users', '/api/admin', '/api/logs'],          // Privilege escalation attempt
    ['/api/auth/login', '/api/auth/login', '/api/auth/login'], // Brute force
    ['/api/members', '/api/export'],                     // Data exfiltration pattern
  ];

  // Known SQL injection patterns in query params
  private readonly QUERY_TAMPER_PATTERNS = [
    /['";]|--|\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b/i,
    /%27|%22|%3B|%2D%2D/i,    // URL-encoded SQL chars
    /\bEXEC\b|\bSP_\w+/i,     // Stored procedure calls
  ];

  use(req: RequestWithFiles, res: Response, next: NextFunction): void {
    const ip       = (req.headers['x-real-ip'] as string) || req.ip || 'unknown';
    const apiKey   = req.headers.authorization?.replace('Bearer ', '') || '';
    const apiKeyHash = apiKey ? createHash('sha256').update(apiKey).digest('hex').slice(0, 16) : 'none';

    // ── Suspicious query tampering ─────────────────────────────────────────
    const queryStr = JSON.stringify(req.query);
    const queryTampered = this.QUERY_TAMPER_PATTERNS.some(r => r.test(queryStr));

    if (queryTampered) {
      this.logForensic('QUERY_TAMPER', ip, req, { query: queryStr, api_key_hash: apiKeyHash });
    }

    // ── API key abuse detection ────────────────────────────────────────────
    this.trackApiKey(apiKeyHash, ip, req.path);

    // ── Endpoint sequence tracking ─────────────────────────────────────────
    const sequenceKey = `${ip}:${apiKeyHash}`;
    this.trackSequence(sequenceKey, req.path);
    const suspicious = this.checkSuspiciousSequence(sequenceKey);
    if (suspicious) {
      this.logForensic('SUSPICIOUS_SEQUENCE', ip, req, {
        sequence: this.sequences.get(sequenceKey)?.endpoints.slice(-5),
        api_key_hash: apiKeyHash,
      });
    }

    // ── File upload hash logging ───────────────────────────────────────────
    const multerFile = req.file;
    const multerFiles = req.files;
    if (multerFile || (multerFiles && Object.keys(multerFiles).length > 0)) {
      const files: MulterFile[] = multerFile
        ? [multerFile]
        : Array.isArray(multerFiles)
          ? multerFiles
          : Object.values(multerFiles as Record<string, MulterFile[]>).flat();
      files.forEach((f: MulterFile) => {
        const fileHash = createHash('sha256').update(f.buffer || Buffer.alloc(0)).digest('hex');
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

  private readonly apiKeyUsage = new Map<string, { count: number; ips: Set<string>; firstSeen: number }>();

  private trackApiKey(keyHash: string, ip: string, path: string): void {
    if (keyHash === 'none') return;
    const now = Date.now();
    let record = this.apiKeyUsage.get(keyHash);

    if (!record) {
      record = { count: 1, ips: new Set([ip]), firstSeen: now };
      this.apiKeyUsage.set(keyHash, record);
      return;
    }

    // Reset window after 1 hour
    if (now - record.firstSeen > 3_600_000) {
      record.count = 1; record.ips = new Set([ip]); record.firstSeen = now;
      return;
    }

    record.count++;
    record.ips.add(ip);

    // Abuse signals: > 500 req/hour or used from > 5 different IPs
    if (record.count > 500 || record.ips.size > 5) {
      this.logForensic('API_KEY_ABUSE', ip, { method: 'SYSTEM', path, originalUrl: path, headers: {} } as unknown as Request, {
        api_key_hash: keyHash,
        request_count: record.count,
        unique_ips: record.ips.size,
      });
    }
  }

  private trackSequence(key: string, endpoint: string): void {
    let seq = this.sequences.get(key);
    const now = Date.now();

    if (!seq) {
      seq = { endpoints: [endpoint], timestamps: [now] };
      this.sequences.set(key, seq);
      return;
    }

    // Keep last 20 endpoints
    seq.endpoints = [...seq.endpoints.slice(-19), endpoint];
    seq.timestamps = [...seq.timestamps.slice(-19), now];

    // Expire entries older than 5 minutes
    while (seq.timestamps.length > 0 && now - seq.timestamps[0] > 300_000) {
      seq.endpoints.shift(); seq.timestamps.shift();
    }
  }

  private checkSuspiciousSequence(key: string): boolean {
    const seq = this.sequences.get(key);
    if (!seq || seq.endpoints.length < 2) return false;

    return this.SUSPICIOUS_SEQUENCES.some(pattern => {
      const patLen = pattern.length;
      const recent = seq.endpoints.slice(-patLen);
      return recent.length === patLen && pattern.every((ep, i) => recent[i]?.includes(ep));
    });
  }

  private logForensic(event: string, ip: string, req: Request, extra: Record<string, unknown>): void {
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
}
