/**
 * VectorService — Milvus vector DB untuk NEWGAME AI features
 *
 * ⚠️ SETUP WAJIB:
 *   npm install @zilliz/milvus2-sdk-node
 *   Set env: MILVUS_ADDRESS, MILVUS_TOKEN (dari Zilliz Cloud)
 *   OPENAI_API_KEY untuk text-embedding-3-small
 *
 * Use cases:
 *   - Semantic search berita & pengumuman
 *   - Rekomendasi project serupa
 *   - RAG chatbot NEWGAME
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Conditional require — aman sebelum SDK terinstall
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MilvusClient: any = null;
let openaiSDK: any    = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const milvus = require('@zilliz/milvus2-sdk-node');
  MilvusClient = milvus.MilvusClient;
} catch { /* belum terinstall */ }

try {
  // OpenAI sudah ada di package.json
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  openaiSDK = require('openai');
} catch { /* fallback */ }

// ── Collection names ──────────────────────────────────────────
const COLLECTIONS = {
  news:     'newgame_news',
  projects: 'newgame_projects',
  members:  'newgame_members',
} as const;

// ── Embedding dimension (text-embedding-3-small) ──────────────
const DIM = 1536;

@Injectable()
export class VectorService implements OnModuleInit {
  private readonly logger = new Logger(VectorService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any   = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openai: any   = null;
  private available     = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    if (!MilvusClient) {
      this.logger.warn('@zilliz/milvus2-sdk-node belum terinstall — Vector DB dinonaktifkan');
      return;
    }

    const address = this.config.get<string>('MILVUS_ADDRESS');
    const token   = this.config.get<string>('MILVUS_TOKEN');

    if (!address) {
      this.logger.warn('MILVUS_ADDRESS tidak ditemukan — Vector DB dinonaktifkan');
      return;
    }

    try {
      this.client = new MilvusClient({ address, token });
      await this._ensureCollections();
      this.available = true;
      this.logger.log('Milvus Vector DB terhubung ✓');
    } catch (e) {
      this.logger.error('Milvus koneksi gagal:', e);
    }

    // Setup OpenAI untuk embedding
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (openaiSDK && apiKey) {
      this.openai = new openaiSDK.OpenAI({ apiKey });
    }
  }

  get isAvailable() { return this.available; }

  // ── Public API ──────────────────────────────────────────────

  /** Upsert berita ke vector store */
  async upsertNews(id: string, title: string, content: string): Promise<void> {
    if (!this.available || !this.openai) return;
    try {
      const embedding = await this._embed(`${title}\n\n${content}`);
      await this.client.upsert({
        collection_name: COLLECTIONS.news,
        data: [{ id, embedding, title, excerpt: content.slice(0, 300) }],
      });
    } catch (e) { this.logger.error('upsertNews error', e); }
  }

  /** Hapus berita dari vector store */
  async deleteNews(id: string): Promise<void> {
    if (!this.available) return;
    try {
      await this.client.delete({
        collection_name: COLLECTIONS.news,
        filter: `id == "${id}"`,
      });
    } catch (e) { this.logger.error('deleteNews error', e); }
  }

  /**
   * Semantic search berita — kembalikan ID yang relevan
   * @param query Teks pencarian
   * @param limit Jumlah hasil (default 5)
   * @param threshold Score minimum (default 0.7)
   */
  async searchNews(query: string, limit = 5, threshold = 0.7): Promise<string[]> {
    if (!this.available || !this.openai) return [];
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
        .filter((r: any) => r.score >= threshold)
        .map((r: any) => r.id as string);
    } catch (e) {
      this.logger.error('searchNews error', e);
      return [];
    }
  }

  // ── Private helpers ─────────────────────────────────────────

  /** Embed teks menggunakan OpenAI text-embedding-3-small */
  private async _embed(text: string): Promise<number[]> {
    const res = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // max token limit
    });
    return res.data[0].embedding as number[];
  }

  /** Buat collections jika belum ada */
  private async _ensureCollections() {
    for (const name of Object.values(COLLECTIONS)) {
      const exists = await this.client.hasCollection({ collection_name: name });
      if (!exists.value) {
        await this.client.createCollection({
          collection_name: name,
          dimension: DIM,
          metric_type: 'COSINE',
          auto_id: false,
          fields: [
            { name: 'id',       data_type: 'VarChar', max_length: 40, is_primary_key: true },
            { name: 'embedding',data_type: 'FloatVector', dim: DIM },
            { name: 'title',    data_type: 'VarChar', max_length: 512 },
            { name: 'excerpt',  data_type: 'VarChar', max_length: 1024 },
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
}
