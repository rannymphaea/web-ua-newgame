import { UserHistoryService } from './user-history.service';
export declare class UserHistoryController {
    private readonly svc;
    constructor(svc: UserHistoryService);
    recent(limit?: string): Promise<import("./user-history.service").HistoryEntry[]>;
    byUser(uid: string, limit?: string): Promise<import("./user-history.service").HistoryEntry[]>;
}
