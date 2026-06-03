import { FirebaseService } from '../../firebase/firebase.service';
import { UserHistoryService } from '../user-history/user-history.service';
import { UserVaultService } from '../user-vault/user-vault.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
export declare class MembersService {
    private readonly firebase;
    private readonly history;
    private readonly vault;
    private readonly logger;
    constructor(firebase: FirebaseService, history: UserHistoryService, vault: UserVaultService);
    list(opts: {
        page: number;
        limit: number;
        search?: string;
        division?: string;
        role?: string;
        status?: string;
    }): Promise<{
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
    create(dto: CreateMemberDto, createdBy: string): Promise<{
        ok: boolean;
        uid: string;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        uid?: undefined;
    }>;
    update(uid: string, dto: UpdateMemberDto, updatedBy: string): Promise<{
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
    remove(uid: string, deletedBy: string): Promise<{
        ok: boolean;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
    }>;
    import(format: 'csv' | 'json', data: string, importedBy: string): Promise<{
        created: number;
        failed: number;
        errors: string[];
        ok: boolean;
    }>;
}
