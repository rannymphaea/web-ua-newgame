import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer?: Buffer;
}
type RequestWithFiles = Request & {
    file?: MulterFile;
    files?: MulterFile[] | Record<string, MulterFile[]>;
};
export declare class ForensicLoggerMiddleware implements NestMiddleware {
    private readonly sequences;
    private readonly SUSPICIOUS_SEQUENCES;
    private readonly QUERY_TAMPER_PATTERNS;
    use(req: RequestWithFiles, res: Response, next: NextFunction): void;
    private readonly apiKeyUsage;
    private trackApiKey;
    private trackSequence;
    private checkSuspiciousSequence;
    private logForensic;
}
export {};
