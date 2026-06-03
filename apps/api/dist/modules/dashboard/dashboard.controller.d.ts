import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly svc;
    constructor(svc: DashboardService);
    stats(): Promise<{
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
