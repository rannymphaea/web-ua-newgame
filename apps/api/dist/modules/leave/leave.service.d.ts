import { FirebaseService } from '../../firebase/firebase.service';
export declare class LeaveService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    createLeaveRequest(userId: string, data: {
        eventId: string;
        reason: string;
        type: 'sick' | 'personal' | 'academic' | 'other';
    }): Promise<{
        id: string;
        message: string;
    }>;
    getLeaveRequests(userId: string, role: string, filters?: {
        status?: string;
        eventId?: string;
        limit?: number;
    }): Promise<{
        id: string;
    }[]>;
    updateLeaveStatus(leaveId: string, adminId: string, status: 'approved' | 'rejected', adminNote?: string): Promise<{
        message: string;
    }>;
}
