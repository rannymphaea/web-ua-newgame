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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const { PrismaClient } = (() => {
    try {
        return require('@prisma/client');
    }
    catch {
        return { PrismaClient: class {
            } };
    }
})();
let PrismaService = PrismaService_1 = class PrismaService extends PrismaClient {
    constructor() {
        super({
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['warn', 'error'],
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
        this._connected = false;
    }
    async onModuleInit() {
        try {
            if (typeof this.$connect === 'function') {
                await this.$connect();
                this._connected = true;
                this.logger.log('PostgreSQL terhubung via Prisma ✓');
            }
            else {
                this.logger.warn('PrismaClient belum ter-generate. Jalankan: npx prisma generate');
            }
        }
        catch (e) {
            this.logger.error('Prisma koneksi gagal — pastikan DATABASE_URL sudah diset:', e);
        }
    }
    async onModuleDestroy() {
        if (this._connected && typeof this.$disconnect === 'function') {
            await this.$disconnect();
        }
    }
    get isConnected() { return this._connected; }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map