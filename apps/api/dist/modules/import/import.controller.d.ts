import { ImportService } from './import.service';
export declare class ImportController {
    private readonly svc;
    constructor(svc: ImportService);
    importCsv(file: any, dryRun: string, user: any): Promise<import("./import.service").ImportResult | {
        ok: boolean;
        error: string;
    }>;
    lastSummary(): Promise<{
        id: string;
    }>;
}
