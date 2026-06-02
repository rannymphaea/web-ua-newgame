"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MilvusClient = null;
let openaiSDK = null;
try {
    const milvus = require('@zilliz/milvus2-sdk-node');
    MilvusClient = milvus.MilvusClient;
}
catch { }
try {
    openaiSDK = require('openai');
}
catch { }
const COLLECTIONS = {
    news: 'newgame_news',
    projects: 'newgame_projects',
    members: 'newgame_members',
};
const DIM = 1536;
let VectorService = VectorService_1 = class VectorService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(VectorService_1.name);
        this.client = null;
        this.openai = null;
        this.available = false;
    }
    async onModuleInit() {
        if (!MilvusClient) {
            this.logger.warn('@zilliz/milvus2-sdk-node belum terinstall — Vector DB dinonaktifkan');
            return;
        }
        const address = this.config.get('MILVUS_ADDRESS');
        const token = this.config.get('MILVUS_TOKEN');
        if (!address) {
            this.logger.warn('MILVUS_ADDRESS tidak ditemukan — Vector DB dinonaktifkan');
            return;
        }
        try {
            this.client = new MilvusClient({ address, token });
            await this._ensureCollections();
            this.available = true;
            this.logger.log('Milvus Vector DB terhubung ✓');
        }
        catch (e) {
            this.logger.error('Milvus koneksi gagal:', e);
        }
        const apiKey = this.config.get('OPENAI_API_KEY');
        if (openaiSDK && apiKey) {
            this.openai = new openaiSDK.OpenAI({ apiKey });
        }
    }
    get isAvailable() { return this.available; }
    async upsertNews(id, title, content) {
        if (!this.available || !this.openai)
            return;
        try {
            const embedding = await this._embed(`${title}\n\n${content}`);
            await this.client.upsert({
                collection_name: COLLECTIONS.news,
                data: [{ id, embedding, title, excerpt: content.slice(0, 300) }],
            });
        }
        catch (e) {
            this.logger.error('upsertNews error', e);
        }
    }
    async deleteNews(id) {
        if (!this.available)
            return;
        try {
            await this.client.delete({
                collection_name: COLLECTIONS.news,
                filter: `id == "${id}"`,
            });
        }
        catch (e) {
            this.logger.error('deleteNews error', e);
        }
    }
    async searchNews(query, limit = 5, threshold = 0.7) {
        if (!this.available || !this.openai)
            return [];
        try {
            const embedding = await this._embed(query);
            const res = await this.client.search({
                collection_name: COLLECTIONS.news,
                vectors: [embedding],
                limit,
                output_fields: ['id', 'title'],
                params: { metric_type: 'COSINE', ef: 64 },
            });
            return (res.results ?? [])
                .filter((r) => r.score >= threshold)
                .map((r) => r.id);
        }
        catch (e) {
            this.logger.error('searchNews error', e);
            return [];
        }
    }
    async _embed(text) {
        const res = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.slice(0, 8000),
        });
        return res.data[0].embedding;
    }
    async _ensureCollections() {
        for (const name of Object.values(COLLECTIONS)) {
            const exists = await this.client.hasCollection({ collection_name: name });
            if (!exists.value) {
                await this.client.createCollection({
                    collection_name: name,
                    dimension: DIM,
                    metric_type: 'COSINE',
                    auto_id: false,
                    fields: [
                        { name: 'id', data_type: 'VarChar', max_length: 40, is_primary_key: true },
                        { name: 'embedding', data_type: 'FloatVector', dim: DIM },
                        { name: 'title', data_type: 'VarChar', max_length: 512 },
                        { name: 'excerpt', data_type: 'VarChar', max_length: 1024 },
                    ],
                });
                await this.client.createIndex({
                    collection_name: name,
                    field_name: 'embedding',
                    index_type: 'HNSW',
                    metric_type: 'COSINE',
                    params: { M: 8, efConstruction: 64 },
                });
                await this.client.loadCollection({ collection_name: name });
                this.logger.log(`Collection '${name}' dibuat ✓`);
            }
        }
    }
};
exports.VectorService = VectorService;
exports.VectorService = VectorService = VectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VectorService);
//# sourceMappingURL=vector.service.js.map