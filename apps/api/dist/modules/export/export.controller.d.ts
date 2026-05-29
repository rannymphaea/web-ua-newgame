import { ExportService } from './export.service';
import { Response } from 'express';
export declare class ExportController {
    private service;
    constructor(service: ExportService);
    exportAttendance(eventId: string, res: Response): Promise<void>;
    exportMembers(res: Response): Promise<void>;
    exportUsers(res: Response): Promise<void>;
}
