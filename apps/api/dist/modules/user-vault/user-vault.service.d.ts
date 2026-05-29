import { FirebaseService } from '../../firebase/firebase.service';
export interface VaultVersion {
    versionId: string;
    userId: string;
    versionNum: number;
    snapshot: Record<string, unknown>;
    prevHash: string;
    hashChain: string;
    createdAt: string;
    changedBy: string;
}
export declare class UserVaultService {
    private readonly firebase;
    private readonly logger;
    constructor(firebase: FirebaseService);
    saveVersion(userId: string, snapshot: Record<string, unknown>, changedBy: string): Promise<string>;
    getVersions(userId: string, limit?: number): Promise<VaultVersion[]>;
    getLatest(userId: string): Promise<VaultVersion | null>;
    getDiff(userId: string, vA: number, vB: number): Promise<{
        versionA: number;
        versionB: number;
        diff: Record<string, {
            from: unknown;
            to: unknown;
        }>;
    }>;
}
