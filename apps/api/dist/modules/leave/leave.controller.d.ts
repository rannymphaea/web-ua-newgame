import { LeaveService } from './leave.service';
export declare class LeaveController {
    private leaveService;
    constructor(leaveService: LeaveService);
    createLeaveRequest(user: any, body: {
        eventId: string;
        reason: string;
        type: 'sick' | 'personal' | 'academic' | 'other';
    }): Promise<{
        id: string;
        message: string;
    }>;
    getLeaveRequests(user: any, status?: string, eventId?: string, limit?: string): Promise<{
        id: string;
    }[]>;
    approveLeave(id: string, user: any, body: {
        adminNote?: string;
    }): Promise<{
        message: string;
    }>;
    rejectLeave(id: string, user: any, body: {
        adminNote?: string;
    }): Promise<{
        message: string;
    }>;
}
