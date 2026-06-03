import { FirebaseService } from '../../firebase/firebase.service';
export declare class LogsService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    getLogs(filters?: {
        action?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        logs: {
            id: string;
        }[];
        total: number;
    }>;
    createLog(data: {
        userId: string;
        action: string;
        details?: Record<string, any>;
        result?: string;
        targetUserId?: string;
        eventId?: string;
    }): Promise<{
        id: string;
    }>;
    exportLogs(filters?: {
        action?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        id: string;
    }[]>;
}
