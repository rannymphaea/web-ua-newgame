import { FirebaseService } from '../../firebase/firebase.service';
export declare class AnomaliesService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    getAnomalies(filters?: {
        type?: string;
        resolved?: boolean;
        limit?: number;
    }): Promise<{
        id: string;
    }[]>;
    detectAnomalies(attendanceData: {
        userId: string;
        eventId: string;
        deviceFingerprint: string;
        attendedAt: Date;
    }): Promise<any[]>;
    resolveAnomaly(anomalyId: string, adminId: string, note?: string): Promise<{
        message: string;
    }>;
}
