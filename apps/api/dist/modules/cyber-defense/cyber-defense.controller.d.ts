import { CyberDefenseService } from './cyber-defense.service';
export declare class CyberDefenseController {
    private readonly defense;
    constructor(defense: CyberDefenseService);
    monitor(): {
        status: string;
        blockedIPs: number;
        trackedIPs: number;
        events1m: number;
        events5m: number;
        recentThreats: import("./cyber-defense.service").ThreatEvent[];
        topThreats: {
            type: string;
            count: number;
        }[];
        blockList: string[];
    };
    events(limit?: string): {
        events: import("./cyber-defense.service").ThreatEvent[];
    };
    ipInfo(ip: string): {
        ip: string;
        record: import("./cyber-defense.service").IpRecord;
        blocked: boolean;
    };
    blockIp(body: {
        ip: string;
        reason?: string;
    }): {
        success: boolean;
        message: string;
    };
    unblockIp(ip: string): {
        success: boolean;
        message: string;
    };
}
