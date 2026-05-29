import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getDashboard(user: any): Promise<{
        user: {
            displayName: any;
            email: any;
            division: any;
            role: any;
            memberId: any;
        };
        stats: {
            xp: any;
            level: number;
            xpInLevel: number;
            xpToNextLevel: number;
            attendanceCount: any;
            streak: any;
            badgesCount: any;
            recentPresent: number;
        };
        recentAttendance: {
            id: string;
        }[];
        ok?: undefined;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        user?: undefined;
        stats?: undefined;
        recentAttendance?: undefined;
    }>;
    getLeaderboard(limit?: string): Promise<{
        rank: number;
        uid: string;
        id: string;
        name: any;
        displayName: any;
        division: any;
        xpCache: any;
        attendanceCount: any;
        streak: any;
        role: any;
        level: number;
    }[] | {
        ok: boolean;
        error: string;
    }>;
    getAllUsers(role?: string): Promise<{
        uid: string;
    }[] | {
        ok: boolean;
        error: string;
    }>;
    getUser(userId: string): Promise<{
        uid: string;
        ok?: undefined;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
    }>;
    updateProfile(user: any, dto: UpdateProfileDto): Promise<{
        ok: boolean;
        message: string;
    } | {
        ok: boolean;
        message?: undefined;
    }>;
    updateRole(userId: string, user: any, body: {
        role: string;
    }): Promise<{
        ok: boolean;
        oldRole: unknown;
        newRole: string;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        oldRole?: undefined;
        newRole?: undefined;
    }>;
    updateStatus(userId: string, user: any, body: {
        status: string;
    }): Promise<{
        ok: boolean;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
    }>;
}
