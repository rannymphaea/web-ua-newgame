import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    verifyMember(body: {
        memberId: string;
        tempPassword: string;
    }): Promise<{
        valid: boolean;
        memberId: any;
        name: any;
        division: any;
        team: any;
        status: any;
    }>;
    register(user: any, body: {
        memberId: string;
        displayName: string;
        division: string;
        team?: string;
    }): Promise<{
        success: boolean;
    }>;
    getProfile(user: any): Promise<{
        id: string;
    }>;
    setRole(caller: any, body: {
        userId: string;
        role: string;
    }): Promise<{
        success: boolean;
        role: string;
    }>;
    getAllUsers(): Promise<{
        id: string;
        displayName: any;
        email: any;
        memberId: any;
        role: any;
        division: any;
        status: any;
    }[]>;
}
