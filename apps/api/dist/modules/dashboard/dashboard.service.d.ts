import { FirebaseService } from '../../firebase/firebase.service';
import { ImportService } from '../import/import.service';
import { UserHistoryService } from '../user-history/user-history.service';
export declare class DashboardService {
    private readonly firebase;
    private readonly importSvc;
    private readonly historySvc;
    private readonly logger;
    constructor(firebase: FirebaseService, importSvc: ImportService, historySvc: UserHistoryService);
    getStats(): Promise<{
        ok: boolean;
        totalUsers: number;
        totalMembers: number;
        recentChanges: import("../user-history/user-history.service").HistoryEntry[];
        lastImportSummary: {
            id: string;
        };
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        totalUsers?: undefined;
        totalMembers?: undefined;
        recentChanges?: undefined;
        lastImportSummary?: undefined;
    }>;
}
