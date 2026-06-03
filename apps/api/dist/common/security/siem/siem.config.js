"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siemConfig = void 0;
exports.siemConfig = {
    elastic: {
        url: process.env.SIEM_ELASTIC_URL || '',
        apiKey: process.env.SIEM_ELASTIC_API_KEY || '',
        index: process.env.SIEM_ELASTIC_INDEX || 'newgame-security',
    },
    loki: {
        url: process.env.SIEM_LOKI_URL || '',
        user: process.env.SIEM_LOKI_USER || '',
        pass: process.env.SIEM_LOKI_PASS || '',
    },
    splunk: {
        url: process.env.SIEM_SPLUNK_URL || '',
        token: process.env.SIEM_SPLUNK_TOKEN || '',
    },
    wazuh: {
        url: process.env.SIEM_WAZUH_URL || '',
        token: process.env.SIEM_WAZUH_TOKEN || '',
    },
    webhook: {
        url: process.env.SIEM_WEBHOOK_URL || '',
        key: process.env.SIEM_WEBHOOK_KEY || '',
    },
    keyRotationDays: parseInt(process.env.SIEM_KEY_ROTATION_DAYS || '30', 10),
    minSeverity: (process.env.SIEM_MIN_SEVERITY || 'MEDIUM'),
    batchSize: parseInt(process.env.SIEM_BATCH_SIZE || '100', 10),
    batchIntervalMs: parseInt(process.env.SIEM_BATCH_INTERVAL_MS || '30000', 10),
};
//# sourceMappingURL=siem.config.js.map