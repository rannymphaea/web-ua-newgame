import { Injectable, Logger } from '@nestjs/common';

export interface AlertPayload {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  ip: string;
  url?: string;
  fingerprint?: string;
  attemptType: string;
  details?: string;
  geoCountry?: string;
  asn?: string;
}

/**
 * AlertService — External notification system
 *
 * Channels: Telegram | Discord | Slack | Email (SMTP)
 *
 * Routing by severity:
 *   CRITICAL → all channels
 *   HIGH     → Telegram + Discord
 *   MEDIUM   → Discord (or configured channel)
 *   LOW      → log only (no external notification)
 *
 * Rate limiting: max 1 alert per IP per 60 seconds
 * (prevents alert flood from single attacker)
 */
@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  // Rate limit: ip → last alert timestamp
  private readonly rateLimitMap = new Map<string, number>();
  private readonly RATE_LIMIT_MS = 60_000;

  async send(payload: AlertPayload): Promise<void> {
    // Rate limit by IP
    const now = Date.now();
    const lastSent = this.rateLimitMap.get(payload.ip) || 0;
    if (now - lastSent < this.RATE_LIMIT_MS && payload.severity !== 'CRITICAL') {
      return; // Suppress non-critical duplicate alerts
    }
    this.rateLimitMap.set(payload.ip, now);

    const tasks: Promise<void>[] = [];

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

  // ── Telegram ────────────────────────────────────────────────────────────────
  private async sendTelegram(payload: AlertPayload): Promise<void> {
    const token  = process.env.ALERT_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.ALERT_TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const text = this.formatMessage(payload, 'telegram');
    const url  = `https://api.telegram.org/bot${token}/sendMessage`;

    await this.post(url, {
      chat_id: chatId,
      text,
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    });
  }

  // ── Discord ─────────────────────────────────────────────────────────────────
  private async sendDiscord(payload: AlertPayload): Promise<void> {
    const webhookUrl = process.env.ALERT_DISCORD_WEBHOOK;
    if (!webhookUrl) return;

    const color = { LOW: 0x22c55e, MEDIUM: 0xf59e0b, HIGH: 0xf97316, CRITICAL: 0xef4444 }[payload.severity];

    await this.post(webhookUrl, {
      username: 'NEWGAME Security',
      embeds: [{
        title: `[${payload.severity}] ${payload.title}`,
        color,
        fields: [
          { name: 'IP Address',    value: `\`${payload.ip}\``,              inline: true },
          { name: 'Attempt Type',  value: payload.attemptType,              inline: true },
          { name: 'Fingerprint',   value: `\`${payload.fingerprint || 'N/A'}\``, inline: false },
          { name: 'URL',           value: payload.url || 'N/A',             inline: false },
          { name: 'Geo',           value: payload.geoCountry || 'Unknown',  inline: true },
          { name: 'ASN',           value: payload.asn || 'Unknown',         inline: true },
          { name: 'Details',       value: payload.details || 'No details',  inline: false },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'NEWGAME Security Monitor' },
      }],
    });
  }

  // ── Slack ───────────────────────────────────────────────────────────────────
  private async sendSlack(payload: AlertPayload): Promise<void> {
    const webhookUrl = process.env.ALERT_SLACK_WEBHOOK;
    if (!webhookUrl) return;

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

  // ── Email (via SMTP relay) ──────────────────────────────────────────────────
  private async sendEmail(payload: AlertPayload): Promise<void> {
    const webhookUrl = process.env.ALERT_EMAIL_WEBHOOK;
    if (!webhookUrl) return;

    // Uses a transactional email webhook (Mailgun, SendGrid, Resend, etc.)
    await this.post(webhookUrl, {
      to:      process.env.ALERT_EMAIL_TO      || 'security@example.com',
      from:    process.env.ALERT_EMAIL_FROM    || 'noreply@newgame.example.com',
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

  // ── Shared HTTP POST ─────────────────────────────────────────────────────────
  private async post(url: string, body: unknown): Promise<void> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) this.logger.warn(`Alert failed: ${url} → ${res.status}`);
    } catch (err: unknown) {
      this.logger.warn(`Alert error: ${url} → ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  // ── Telegram message formatter ───────────────────────────────────────────────
  private formatMessage(payload: AlertPayload, _channel: string): string {
    // Escape MarkdownV2 special chars for Telegram
    const esc = (s: string) => s.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
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
}
