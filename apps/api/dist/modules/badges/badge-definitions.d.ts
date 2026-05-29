export declare const BADGE_RARITIES: {
    id: string;
    label: string;
    color: string;
    glow: boolean;
}[];
export declare const BADGE_CATEGORIES: {
    id: string;
    label: string;
}[];
export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    category: string;
    rarity: string;
    icon: string;
    condition: {
        type: 'auto' | 'manual' | 'hidden' | 'seasonal';
        check?: string;
        value?: number;
        note?: string;
    };
}
export declare const BADGES: BadgeDefinition[];
