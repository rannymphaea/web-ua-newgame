export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export interface ThreatEvent {
    id: string;
    ip: string;
    uid?: string;
    type: string;
    level: ThreatLevel;
    detail: string;
    detectedAt: Date;
    mitigated: boolean;
}
export interface IpRecord {
    count: number;
    firstSeen: number;
    blocked: boolean;
    score: number;
}
export declare class CyberDefenseService {
    private readonly logger;
    private readonly ipMap;
    private readonly events;
    private readonly blocklist;
    private eventIdCounter;
    private readonly MAX_EVENTS;
    private readonly RATE_THRESHOLD;
    private readonly BLOCK_SCORE;
    analyze(ctx: {
        ip: string;
        path: string;
        body: string;
        ua: string;
        uid?: string;
        method: string;
    }): {
        blocked: boolean;
        threats: ThreatEvent[];
    };
    private adaptiveResponse;
    private trackIp;
    block(ip: string, reason: string): void;
    unblock(ip: string): void;
    getMonitoringSnapshot(): {
        status: string;
        blockedIPs: number;
        trackedIPs: number;
        events1m: number;
        events5m: number;
        recentThreats: ThreatEvent[];
        topThreats: {
            type: string;
            count: number;
        }[];
        blockList: string[];
    };
    getRecentEvents(limit?: number): ThreatEvent[];
    getIpInfo(ip: string): {
        ip: string;
        record: IpRecord;
        blocked: boolean;
    };
    private createEvent;
    private scoreIncrement;
    private maxLevel;
    private getTopThreats;
}
