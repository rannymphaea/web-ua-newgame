import { FirebaseService } from '../../firebase/firebase.service';
import { UserHistoryService } from '../user-history/user-history.service';
import { UserVaultService } from '../user-vault/user-vault.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private firebaseService;
    private history;
    private vault;
    private readonly logger;
    constructor(firebaseService: FirebaseService, history: UserHistoryService, vault: UserVaultService);
    getUserById(userId: string): Promise<{
        uid: string;
        ok?: undefined;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        ok: boolean;
        message: string;
    } | {
        ok: boolean;
        message?: undefined;
    }>;
    getAllUsers(role?: string): Promise<{
        uid: string;
    }[] | {
        ok: boolean;
        error: string;
    }>;
    updateUserRole(targetUserId: string, newRole: string, updatedBy: string): Promise<{
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
    updateUserStatus(targetUserId: string, status: string, updatedBy: string): Promise<{
        ok: boolean;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
    }>;
    getLeaderboard(limit?: number): Promise<{
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
    getDashboardStats(userId: string): Promise<{
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
}
