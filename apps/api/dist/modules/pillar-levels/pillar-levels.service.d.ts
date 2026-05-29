import { FirebaseService } from '../../firebase/firebase.service';
export declare class PillarLevelsService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
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
    getUserPillarLevel(userId: string): Promise<{
        id: string;
    }[]>;
    assignLevel(userId: string, pillarId: string, level: number, assignedBy: string): Promise<{
        success: boolean;
    }>;
    getAllMemberLevels(): Promise<{
        id: string;
    }[]>;
}
