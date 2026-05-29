import { FirebaseService } from '../../firebase/firebase.service';
export declare class BadgesService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
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
    getUserBadges(userId: string): Promise<{
        id: string;
    }[]>;
    checkAndAward(userId: string): Promise<string[]>;
    awardBadge(userId: string, badgeId: string, awardedBy: string): Promise<{
        success: boolean;
        badge: string;
    }>;
    revokeBadge(userId: string, badgeId: string): Promise<{
        success: boolean;
    }>;
}
