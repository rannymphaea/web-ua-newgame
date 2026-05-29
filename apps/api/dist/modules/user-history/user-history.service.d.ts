import { FirebaseService } from '../../firebase/firebase.service';
export interface HistoryEntry {
    historyId: string;
    userId: string;
    changedBy: string;
    action: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    changedFields: string[];
    diffHash: string;
    timestamp: string;
}
export declare class UserHistoryService {
    private readonly firebase;
    private readonly logger;
    constructor(firebase: FirebaseService);
    write(entry: Omit<HistoryEntry, 'historyId' | 'diffHash' | 'timestamp'>): Promise<string>;
    getByUser(userId: string, limit?: number): Promise<HistoryEntry[]>;
    getRecent(limit?: number): Promise<HistoryEntry[]>;
}
