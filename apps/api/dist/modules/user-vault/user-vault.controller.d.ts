import { UserVaultService } from './user-vault.service';
export declare class UserVaultController {
    private readonly svc;
    constructor(svc: UserVaultService);
    versions(uid: string, limit?: string): Promise<import("./user-vault.service").VaultVersion[]>;
    latest(uid: string): Promise<import("./user-vault.service").VaultVersion>;
    diff(uid: string, a: string, b: string): Promise<{
        versionA: number;
        versionB: number;
        diff: Record<string, {
            from: unknown;
            to: unknown;
        }>;
    }>;
}
