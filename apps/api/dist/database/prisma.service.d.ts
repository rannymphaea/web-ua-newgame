import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
declare const PrismaService_base: any;
export declare class PrismaService extends PrismaService_base implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private _connected;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get isConnected(): boolean;
}
export {};
