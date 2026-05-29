import { PillarLevelsService } from './pillar-levels.service';
export declare class PillarLevelsController {
    private service;
    constructor(service: PillarLevelsService);
    getDefinitions(): {
        pillars: {
            id: string;
            name: string;
            logo: string;
        }[];
        levels: {
            level: number;
            label: string;
            color: string;
            requirements: string;
        }[];
    };
    getMyLevels(user: any): Promise<{
        id: string;
    }[]>;
    getUserLevels(userId: string): Promise<{
        id: string;
    }[]>;
    getAll(): Promise<{
        id: string;
    }[]>;
    assign(user: any, body: {
        userId: string;
        pillarId: string;
        level: number;
    }): Promise<{
        success: boolean;
    }>;
}
