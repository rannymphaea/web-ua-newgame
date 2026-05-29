import { FirebaseService } from '../../firebase/firebase.service';
export declare class XpService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    editXPManual(targetUserId: string, newXP: number, reason: string, editorId: string, editorRole: string): Promise<{
        success: boolean;
        oldXP: any;
        newXP: number;
    }>;
    getXPHistory(userId: string, limit?: number): Promise<{
        id: string;
    }[]>;
}
