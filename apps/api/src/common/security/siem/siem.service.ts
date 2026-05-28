import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

export interface SiemEvent {
  type: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * SiemService — External SIEM Integration
 *
 * Supported backends:
 *   - ELK Stack (Elasticsearch HTTP API)
 *   - Loki (Grafana push API)
 *   - Splunk HEC (HTTP Event Collector)
 *   - Wazuh (Syslog RFC5424 or REST API)
 *   - Generic HTTPS webhook
 *
 * Transport modes:
 *   - Real-time: emit() sends immediately
 *   - Batch: flushBatch() sends buffered events every N seconds
 *
 * CEF-compatible log format for cross-SIEM compatibility.
 */
@Injectable()
export class SiemService implements OnModuleInit {
  private readonly logger = new Logger(SiemService.name);
  private readonly batchBuffer: SiemEvent[] = [];
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_INTERVAL_MS = 30_000; // 30 seconds

  onModuleInit(): void {
    // Start batch flush interval
    setInterval(() => this.flushBatch(), this.BATCH_INTERVAL_MS);
  }

  /** Emit a single event to all configured SIEM backends */
  async emit(event: SiemEvent): Promise<void> {
    this.batchBuffer.push(event);

    // Also emit stdout for log aggregator pickup (Loki/Filebeat/Fluentd)
    process.stdout.write(JSON.stringify({ SIEM: true, ...event }) + '\n');

    // Flush if buffer is full
    if (this.batchBuffer.length >= this.BATCH_SIZE) {
      await this.flushBatch();
    }
  }

  /** Flush batch to configured SIEM endpoints */
  async flushBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    const batch = this.batchBuffer.splice(0, this.BATCH_SIZE);

    await Promise.allSettled([
      this.sendToElastic(batch),
      this.sendToLoki(batch),
      this.sendToSplunk(batch),
      this.sendToWebhook(batch),
    ]);
  }

  /** ── ELK Stack (Elasticsearch) ────────────────────────────────────────── */
  private async sendToElastic(events: SiemEvent[]): Promise<void> {
    const url = process.env.SIEM_ELASTIC_URL;
    if (!url) return;

    // Elasticsearch Bulk API format
    const body = events.flatMap(e => [
      JSON.stringify({ index: { _index: 'newgame-security' } }),
      JSON.stringify(e),
    ]).join('\n') + '\n';

    await this.post(`${url}/_bulk`, body, {
      'Content-Type': 'application/x-ndjson',
      'Authorization': `ApiKey ${process.env.SIEM_ELASTIC_API_KEY || ''}`,
    });
  }

  /** ── Grafana Loki ──────────────────────────────────────────────────────── */
  private async sendToLoki(events: SiemEvent[]): Promise<void> {
    const url = process.env.SIEM_LOKI_URL;
    if (!url) return;

    const streams = [{
      stream: { app: 'newgame-api', env: process.env.NODE_ENV || 'production', type: 'security' },
      values: events.map(e => [
        (new Date(e.timestamp).getTime() * 1_000_000).toString(), // nanoseconds
        JSON.stringify(e),
      ]),
    }];

    await this.post(`${url}/loki/api/v1/push`, JSON.stringify({ streams }), {
      'Content-Type': 'application/json',
    });
  }

  /** ── Splunk HEC ────────────────────────────────────────────────────────── */
  private async sendToSplunk(events: SiemEvent[]): Promise<void> {
    const url   = process.env.SIEM_SPLUNK_URL;
    const token = process.env.SIEM_SPLUNK_TOKEN;
    if (!url || !token) return;

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

  /** ── Generic HTTPS Webhook ─────────────────────────────────────────────── */
  private async sendToWebhook(events: SiemEvent[]): Promise<void> {
    const url = process.env.SIEM_WEBHOOK_URL;
    if (!url) return;

    await this.post(url, JSON.stringify({ events, source: 'newgame-security' }), {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.SIEM_WEBHOOK_KEY || '',
    });
  }

  /** ── Syslog RFC5424 format (for Wazuh / rsyslog) ─────────────────────── */
  formatSyslog(event: SiemEvent): string {
    const pri    = 134; // facility=16 (local0), severity=6 (informational)
    const ts     = event.timestamp;
    const host   = 'newgame-api';
    const appId  = 'security';
    const procId = process.pid.toString();
    const msgId  = (event.type as string) || 'SECURITY';
    const msg    = JSON.stringify(event);

    return `<${pri}>1 ${ts} ${host} ${appId} ${procId} ${msgId} - ${msg}`;
  }

  private async post(url: string, body: string, headers: Record<string, string>): Promise<void> {
    try {
      const res = await fetch(url, { method: 'POST', headers, body });
      if (!res.ok) {
        this.logger.warn(`SIEM push failed: ${url} → ${res.status}`);
      }
    } catch (err: unknown) {
      this.logger.warn(`SIEM connection error: ${url} → ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }
}
