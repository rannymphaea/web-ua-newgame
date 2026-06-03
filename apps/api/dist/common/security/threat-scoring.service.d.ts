export interface ScoringInput {
    ip: string;
    ja3: string;
    url: string;
    method: string;
    userAgent: string;
    payloadHash: string;
    deviceSig: string;
}
export declare class ThreatScoringService {
    private readonly ipRecords;
    private readonly BLOCKED_PREFIXES;
    private readonly SCANNER_UA;
    private readonly SENSITIVE_PATHS;
    score(input: ScoringInput): number;
    private trackIP;
    private isHighEntropyURL;
    private hasSuspiciousPayloadHash;
    cleanup(): void;
}
