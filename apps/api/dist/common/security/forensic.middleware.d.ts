import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FingerprintService } from './fingerprint.service';
import { ThreatScoringService } from './threat-scoring.service';
export interface ForensicLog {
    timestamp: string;
    request_id: string;
    ip: string;
    ja3: string;
    url: string;
    method: string;
    payload_hash: string;
    device_signature: string;
    score: number;
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
export declare class ForensicMiddleware implements NestMiddleware {
    private readonly fingerprint;
    private readonly threatScoring;
    constructor(fingerprint: FingerprintService, threatScoring: ThreatScoringService);
    use(req: Request & {
        forensic?: ForensicLog;
    }, res: Response, next: NextFunction): void;
    private generateRequestId;
    private emitLog;
}
