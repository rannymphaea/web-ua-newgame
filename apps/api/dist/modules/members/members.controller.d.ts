import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
export declare class MembersController {
    private readonly svc;
    constructor(svc: MembersService);
    list(page?: string, limit?: string, search?: string, division?: string, role?: string, status?: string): Promise<{
        data: {
            uid: string;
        }[];
        page: number;
        limit: number;
        hasMore: boolean;
        ok?: undefined;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        data: any[];
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
    getOne(uid: string): Promise<{
        recentHistory: import("../user-history/user-history.service").HistoryEntry[];
        latestVault: import("../user-vault/user-vault.service").VaultVersion;
        ok: boolean;
        uid: string;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
    }>;
    create(dto: CreateMemberDto, u: any): Promise<{
        ok: boolean;
        uid: string;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        uid?: undefined;
    }>;
    import(body: {
        format: 'csv' | 'json';
        data: string;
    }, u: any): Promise<{
        created: number;
        failed: number;
        errors: string[];
        ok: boolean;
    }>;
    update(uid: string, dto: UpdateMemberDto, u: any): Promise<{
        ok: boolean;
        message: string;
        error?: undefined;
    } | {
        ok: boolean;
        message?: undefined;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        message?: undefined;
    }>;
    remove(uid: string, u: any): Promise<{
        ok: boolean;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
    }>;
}
