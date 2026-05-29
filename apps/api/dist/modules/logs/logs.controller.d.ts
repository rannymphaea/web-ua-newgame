import { LogsService } from './logs.service';
export declare class LogsController {
    private logsService;
    constructor(logsService: LogsService);
    getLogs(action?: string, userId?: string, startDate?: string, endDate?: string, limit?: string, offset?: string): Promise<{
        logs: {
            id: string;
        }[];
        total: number;
    }>;
    exportLogs(action?: string, startDate?: string, endDate?: string): Promise<{
        id: string;
    }[]>;
}
