import { FirebaseService } from '../../firebase/firebase.service';
export declare class AttendanceService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    processAttendance(userId: string, tokenId: string, deviceFingerprint: string): Promise<{
        success: boolean;
        xpGained: any;
        streakBonus: number;
        newStreak: number;
        totalXP: any;
        eventName: any;
    }>;
    getAttendanceHistory(userId: string, limit?: number): Promise<{
        id: string;
    }[]>;
    checkAttendance(userId: string, eventId: string): Promise<{
        attended: boolean;
    }>;
    getEventAttendance(eventId: string): Promise<{
        id: string;
    }[]>;
    private checkAnomaly;
}
