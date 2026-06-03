import { BadgesService } from './badges.service';
export declare class BadgesController {
    private badgesService;
    constructor(badgesService: BadgesService);
    getDefinitions(): {
        badges: import("./badge-definitions").BadgeDefinition[];
        rarities: {
            id: string;
            label: string;
            color: string;
            glow: boolean;
        }[];
        categories: {
            id: string;
            label: string;
        }[];
    };
    getMyBadges(user: any): Promise<{
        id: string;
    }[]>;
    checkMyBadges(user: any): Promise<string[]>;
    getUserBadges(userId: string): Promise<{
        id: string;
    }[]>;
    awardBadge(user: any, body: {
        userId: string;
        badgeId: string;
    }): Promise<{
        success: boolean;
        badge: string;
    }>;
    revokeBadge(body: {
        userId: string;
        badgeId: string;
    }): Promise<{
        success: boolean;
    }>;
}
