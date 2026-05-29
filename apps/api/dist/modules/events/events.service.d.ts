import { FirebaseService } from '../../firebase/firebase.service';
export declare class EventsService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    createEvent(creatorId: string, data: {
        name: string;
        description?: string;
        xpReward?: number;
        xpPenalty?: number;
    }): Promise<{
        success: boolean;
        eventId: string;
    }>;
    getEvents(status?: string, limit?: number): Promise<any>;
    generateToken(eventId: string, creatorId: string): Promise<{
        success: boolean;
        tokenId: string;
        expiresAt: number;
    }>;
    closeEvent(eventId: string, requesterId: string, requesterRole: string, approverId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateSecureToken;
}
