import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private attendanceService;
    constructor(attendanceService: AttendanceService);
    processAttendance(user: any, body: {
        tokenId: string;
        deviceFingerprint: string;
    }): Promise<{
        success: boolean;
        xpGained: any;
        streakBonus: number;
        newStreak: number;
        totalXP: any;
        eventName: any;
    }>;
    getMyHistory(user: any, limit?: string): Promise<{
        id: string;
    }[]>;
    checkAttendance(user: any, eventId: string): Promise<{
        attended: boolean;
    }>;
    getEventAttendance(eventId: string): Promise<{
        id: string;
    }[]>;
}
