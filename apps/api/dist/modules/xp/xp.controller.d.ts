import { XpService } from './xp.service';
export declare class XpController {
    private xpService;
    constructor(xpService: XpService);
    editXP(user: any, body: {
        targetUserId: string;
        newXP: number;
        reason: string;
    }): Promise<{
        success: boolean;
        oldXP: any;
        newXP: number;
    }>;
    getHistory(userId: string, limit?: string): Promise<{
        id: string;
    }[]>;
}
