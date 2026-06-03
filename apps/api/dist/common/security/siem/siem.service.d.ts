import { OnModuleInit } from '@nestjs/common';
export interface SiemEvent {
    type: string;
    timestamp: string;
    [key: string]: unknown;
}
export declare class SiemService implements OnModuleInit {
    private readonly logger;
    private readonly batchBuffer;
    private readonly BATCH_SIZE;
    private readonly BATCH_INTERVAL_MS;
    onModuleInit(): void;
    emit(event: SiemEvent): Promise<void>;
    flushBatch(): Promise<void>;
    private sendToElastic;
    private sendToLoki;
    private sendToSplunk;
    private sendToWebhook;
    formatSyslog(event: SiemEvent): string;
    private post;
}
