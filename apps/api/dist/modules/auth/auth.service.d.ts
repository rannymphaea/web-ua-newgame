import { FirebaseService } from '../../firebase/firebase.service';
export declare class AuthService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    verifyMember(memberId: string, tempPassword: string): Promise<{
        valid: boolean;
        memberId: any;
        name: any;
        division: any;
        team: any;
        status: any;
    }>;
    createUserProfile(uid: string, data: {
        memberId: string;
        email: string;
        displayName: string;
        division: string;
        team?: string;
    }): Promise<{
        success: boolean;
    }>;
    getUserProfile(uid: string): Promise<{
        id: string;
    }>;
    setUserRole(uid: string, role: string, callerRole?: string): Promise<{
        success: boolean;
        role: string;
    }>;
    getAllUsers(limit?: number): Promise<{
        id: string;
        displayName: any;
        email: any;
        memberId: any;
        role: any;
        division: any;
        status: any;
    }[]>;
}
