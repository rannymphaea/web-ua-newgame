"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SiemService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemService = void 0;
const common_1 = require("@nestjs/common");
let SiemService = SiemService_1 = class SiemService {
    constructor() {
        this.logger = new common_1.Logger(SiemService_1.name);
        this.batchBuffer = [];
        this.BATCH_SIZE = 100;
        this.BATCH_INTERVAL_MS = 30_000;
    }
    onModuleInit() {
        setInterval(() => this.flushBatch(), this.BATCH_INTERVAL_MS);
    }
    async emit(event) {
        this.batchBuffer.push(event);
        process.stdout.write(JSON.stringify({ SIEM: true, ...event }) + '\n');
        if (this.batchBuffer.length >= this.BATCH_SIZE) {
            await this.flushBatch();
        }
    }
    async flushBatch() {
        if (this.batchBuffer.length === 0)
            return;
        const batch = this.batchBuffer.splice(0, this.BATCH_SIZE);
        await Promise.allSettled([
            this.sendToElastic(batch),
            this.sendToLoki(batch),
            this.sendToSplunk(batch),
            this.sendToWebhook(batch),
        ]);
    }
    async sendToElastic(events) {
        const url = process.env.SIEM_ELASTIC_URL;
        if (!url)
            return;
        const body = events.flatMap(e => [
            JSON.stringify({ index: { _index: 'newgame-security' } }),
            JSON.stringify(e),
        ]).join('\n') + '\n';
        await this.post(`${url}/_bulk`, body, {
            'Content-Type': 'application/x-ndjson',
            'Authorization': `ApiKey ${process.env.SIEM_ELASTIC_API_KEY || ''}`,
        });
    }
    async sendToLoki(events) {
        const url = process.env.SIEM_LOKI_URL;
        if (!url)
            return;
        const streams = [{
                stream: { app: 'newgame-api', env: process.env.NODE_ENV || 'production', type: 'security' },
                values: events.map(e => [
                    (new Date(e.timestamp).getTime() * 1_000_000).toString(),
                    JSON.stringify(e),
                ]),
            }];
        await this.post(`${url}/loki/api/v1/push`, JSON.stringify({ streams }), {
            'Content-Type': 'application/json',
        });
    }
    async sendToSplunk(events) {
        const url = process.env.SIEM_SPLUNK_URL;
        const token = process.env.SIEM_SPLUNK_TOKEN;
        if (!url || !token)
            return;
        const body = events.map(e => JSON.stringify({
            time: new Date(e.timestamp).getTime() / 1000,
            host: 'newgame-api',
            source: 'security-middleware',
            sourcetype: '_json',
            event: e,
        })).join('\n');
        await this.post(`${url}/services/collector`, body, {
            'Authorization': `Splunk ${token}`,
            'Content-Type': 'application/json',
        });
    }
    async sendToWebhook(events) {
        const url = process.env.SIEM_WEBHOOK_URL;
        if (!url)
            return;
        await this.post(url, JSON.stringify({ events, source: 'newgame-security' }), {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.SIEM_WEBHOOK_KEY || '',
        });
    }
    formatSyslog(event) {
        const pri = 134;
        const ts = event.timestamp;
        const host = 'newgame-api';
        const appId = 'security';
        const procId = process.pid.toString();
        const msgId = event.type || 'SECURITY';
        const msg = JSON.stringify(event);
        return `<${pri}>1 ${ts} ${host} ${appId} ${procId} ${msgId} - ${msg}`;
    }
    async post(url, body, headers) {
        try {
            const res = await fetch(url, { method: 'POST', headers, body });
            if (!res.ok) {
                this.logger.warn(`SIEM push failed: ${url} → ${res.status}`);
            }
        }
        catch (err) {
            this.logger.warn(`SIEM connection error: ${url} → ${err instanceof Error ? err.message : 'unknown'}`);
        }
    }
};
exports.SiemService = SiemService;
exports.SiemService = SiemService = SiemService_1 = __decorate([
    (0, common_1.Injectable)()
], SiemService);
//# sourceMappingURL=siem.service.js.map