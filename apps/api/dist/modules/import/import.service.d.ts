import { FirebaseService } from '../../firebase/firebase.service';
import { UserHistoryService } from '../user-history/user-history.service';
import { UserVaultService } from '../user-vault/user-vault.service';
export interface ImportRow {
    name: string;
    email: string;
    username?: string;
    division?: string;
    role?: string;
    memberId?: string;
    status?: string;
}
export interface ImportResult {
    total: number;
    inserted: number;
    skipped: number;
    errors: Array<{
        row: number;
        email: string;
        reason: string;
    }>;
    dryRun: boolean;
}
export declare class ImportService {
    private readonly firebase;
    private readonly history;
    private readonly vault;
    private readonly logger;
    constructor(firebase: FirebaseService, history: UserHistoryService, vault: UserVaultService);
    parseCSV(buffer: Buffer): ImportRow[];
    importRows(rows: ImportRow[], importedBy: string, dryRun?: boolean): Promise<ImportResult>;
    getLastImportSummary(): Promise<{
        id: string;
    }>;
}
