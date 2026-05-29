"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AlertService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const common_1 = require("@nestjs/common");
let AlertService = AlertService_1 = class AlertService {
    constructor() {
        this.logger = new common_1.Logger(AlertService_1.name);
        this.rateLimitMap = new Map();
        this.RATE_LIMIT_MS = 60_000;
    }
    async send(payload) {
        const now = Date.now();
        const lastSent = this.rateLimitMap.get(payload.ip) || 0;
        if (now - lastSent < this.RATE_LIMIT_MS && payload.severity !== 'CRITICAL') {
            return;
        }
        this.rateLimitMap.set(payload.ip, now);
        const tasks = [];
        if (payload.severity === 'CRITICAL' || payload.severity === 'HIGH') {
            tasks.push(this.sendTelegram(payload));
            tasks.push(this.sendDiscord(payload));
            tasks.push(this.sendSlack(payload));
        }
        if (payload.severity === 'CRITICAL') {
            tasks.push(this.sendEmail(payload));
        }
        if (payload.severity === 'MEDIUM') {
            tasks.push(this.sendDiscord(payload));
        }
        await Promise.allSettled(tasks);
    }
    async sendTelegram(payload) {
        const token = process.env.ALERT_TELEGRAM_BOT_TOKEN;
        const chatId = process.env.ALERT_TELEGRAM_CHAT_ID;
        if (!token || !chatId)
            return;
        const text = this.formatMessage(payload, 'telegram');
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await this.post(url, {
            chat_id: chatId,
            text,
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
        });
    }
    async sendDiscord(payload) {
        const webhookUrl = process.env.ALERT_DISCORD_WEBHOOK;
        if (!webhookUrl)
            return;
        const color = { LOW: 0x22c55e, MEDIUM: 0xf59e0b, HIGH: 0xf97316, CRITICAL: 0xef4444 }[payload.severity];
        await this.post(webhookUrl, {
            username: 'NEWGAME Security',
            embeds: [{
                    title: `[${payload.severity}] ${payload.title}`,
                    color,
                    fields: [
                        { name: 'IP Address', value: `\`${payload.ip}\``, inline: true },
                        { name: 'Attempt Type', value: payload.attemptType, inline: true },
                        { name: 'Fingerprint', value: `\`${payload.fingerprint || 'N/A'}\``, inline: false },
                        { name: 'URL', value: payload.url || 'N/A', inline: false },
                        { name: 'Geo', value: payload.geoCountry || 'Unknown', inline: true },
                        { name: 'ASN', value: payload.asn || 'Unknown', inline: true },
                        { name: 'Details', value: payload.details || 'No details', inline: false },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: { text: 'NEWGAME Security Monitor' },
                }],
        });
    }
    async sendSlack(payload) {
        const webhookUrl = process.env.ALERT_SLACK_WEBHOOK;
        if (!webhookUrl)
            return;
        const emoji = { LOW: ':white_check_mark:', MEDIUM: ':warning:', HIGH: ':rotating_light:', CRITICAL: ':sos:' }[payload.severity];
        await this.post(webhookUrl, {
            text: `${emoji} *[${payload.severity}] ${payload.title}*`,
            blocks: [
                { type: 'header', text: { type: 'plain_text', text: `${payload.severity}: ${payload.title}` } },
                {
                    type: 'section',
                    fields: [
                        { type: 'mrkdwn', text: `*IP:* \`${payload.ip}\`` },
                        { type: 'mrkdwn', text: `*Type:* ${payload.attemptType}` },
                        { type: 'mrkdwn', text: `*Fingerprint:* \`${payload.fingerprint || 'N/A'}\`` },
                        { type: 'mrkdwn', text: `*Details:* ${payload.details || 'N/A'}` },
                    ],
                },
            ],
        });
    }
    async sendEmail(payload) {
        const webhookUrl = process.env.ALERT_EMAIL_WEBHOOK;
        if (!webhookUrl)
            return;
        await this.post(webhookUrl, {
            to: process.env.ALERT_EMAIL_TO || 'security@example.com',
            from: process.env.ALERT_EMAIL_FROM || 'noreply@newgame.example.com',
            subject: `[CRITICAL SECURITY ALERT] ${payload.title}`,
            html: `
        <h2 style="color:#ef4444">[${payload.severity}] ${payload.title}</h2>
        <table border="1" cellpadding="8" style="border-collapse:collapse;font-family:monospace">
          <tr><td><b>IP Address</b></td><td>${payload.ip}</td></tr>
          <tr><td><b>Attempt Type</b></td><td>${payload.attemptType}</td></tr>
          <tr><td><b>Fingerprint</b></td><td>${payload.fingerprint || 'N/A'}</td></tr>
          <tr><td><b>URL</b></td><td>${payload.url || 'N/A'}</td></tr>
          <tr><td><b>Geo</b></td><td>${payload.geoCountry || 'Unknown'}</td></tr>
          <tr><td><b>ASN</b></td><td>${payload.asn || 'Unknown'}</td></tr>
          <tr><td><b>Details</b></td><td>${payload.details || 'N/A'}</td></tr>
          <tr><td><b>Timestamp</b></td><td>${new Date().toISOString()}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:12px">NEWGAME Security Monitor — This is an automated alert. Do not reply.</p>
      `,
        });
    }
    async post(url, body) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok)
                this.logger.warn(`Alert failed: ${url} → ${res.status}`);
        }
        catch (err) {
            this.logger.warn(`Alert error: ${url} → ${err instanceof Error ? err.message : 'unknown'}`);
        }
    }
    formatMessage(payload, _channel) {
        const esc = (s) => s.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
        return [
            `*\\[${esc(payload.severity)}\\] ${esc(payload.title)}*`,
            `IP: \`${esc(payload.ip)}\``,
            `Type: ${esc(payload.attemptType)}`,
            `Fingerprint: \`${esc(payload.fingerprint || 'N/A')}\``,
            `Geo: ${esc(payload.geoCountry || 'Unknown')} / ASN: ${esc(payload.asn || 'Unknown')}`,
            `Details: ${esc(payload.details || 'N/A')}`,
            `Time: ${esc(new Date().toISOString())}`,
        ].join('\n');
    }
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = AlertService_1 = __decorate([
    (0, common_1.Injectable)()
], AlertService);
//# sourceMappingURL=alert.service.js.map