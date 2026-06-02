import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class VectorService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    private client;
    private openai;
    private available;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    get isAvailable(): boolean;
    upsertNews(id: string, title: string, content: string): Promise<void>;
    deleteNews(id: string): Promise<void>;
    searchNews(query: string, limit?: number, threshold?: number): Promise<string[]>;
    private _embed;
    private _ensureCollections;
}
