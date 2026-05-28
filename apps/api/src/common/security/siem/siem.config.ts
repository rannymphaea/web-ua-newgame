/**
 * SIEM Configuration
 * All values read from environment variables — never hardcoded.
 * Copy .env.example and fill in your SIEM endpoints.
 */
export const siemConfig = {
  elastic: {
    url:    process.env.SIEM_ELASTIC_URL     || '',
    apiKey: process.env.SIEM_ELASTIC_API_KEY || '',
    index:  process.env.SIEM_ELASTIC_INDEX   || 'newgame-security',
  },
  loki: {
    url:  process.env.SIEM_LOKI_URL  || '',
    user: process.env.SIEM_LOKI_USER || '',
    pass: process.env.SIEM_LOKI_PASS || '',
  },
  splunk: {
    url:   process.env.SIEM_SPLUNK_URL   || '',
    token: process.env.SIEM_SPLUNK_TOKEN || '',
  },
  wazuh: {
    url:   process.env.SIEM_WAZUH_URL   || '',
    token: process.env.SIEM_WAZUH_TOKEN || '',
  },
  webhook: {
    url: process.env.SIEM_WEBHOOK_URL || '',
    key: process.env.SIEM_WEBHOOK_KEY || '',
  },
  /** Rotate API keys every N days (set via cron + CI/CD secrets rotation) */
  keyRotationDays: parseInt(process.env.SIEM_KEY_ROTATION_DAYS || '30', 10),
  /** Minimum severity to push to SIEM: LOW | MEDIUM | HIGH | CRITICAL */
  minSeverity: (process.env.SIEM_MIN_SEVERITY || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  /** Batch flush size */
  batchSize: parseInt(process.env.SIEM_BATCH_SIZE || '100', 10),
  /** Batch flush interval in ms */
  batchIntervalMs: parseInt(process.env.SIEM_BATCH_INTERVAL_MS || '30000', 10),
};

/**
 * Required environment variables for SIEM (add to .env):
 *
 * # Elasticsearch
 * SIEM_ELASTIC_URL=https://your-elastic-host:9200
 * SIEM_ELASTIC_API_KEY=your-base64-encoded-api-key
 * SIEM_ELASTIC_INDEX=newgame-security
 *
 * # Grafana Loki
 * SIEM_LOKI_URL=https://your-loki-host:3100
 * SIEM_LOKI_USER=your-loki-user
 * SIEM_LOKI_PASS=your-loki-password
 *
 * # Splunk HEC
 * SIEM_SPLUNK_URL=https://your-splunk-host:8088
 * SIEM_SPLUNK_TOKEN=your-splunk-hec-token
 *
 * # Wazuh
 * SIEM_WAZUH_URL=https://your-wazuh-host:55000
 * SIEM_WAZUH_TOKEN=your-wazuh-api-token
 *
 * # Generic webhook
 * SIEM_WEBHOOK_URL=https://your-siem-webhook-endpoint
 * SIEM_WEBHOOK_KEY=your-webhook-api-key
 *
 * # Settings
 * SIEM_MIN_SEVERITY=MEDIUM
 * SIEM_BATCH_SIZE=100
 * SIEM_BATCH_INTERVAL_MS=30000
 * SIEM_KEY_ROTATION_DAYS=30
 */
