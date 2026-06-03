export declare const siemConfig: {
    elastic: {
        url: string;
        apiKey: string;
        index: string;
    };
    loki: {
        url: string;
        user: string;
        pass: string;
    };
    splunk: {
        url: string;
        token: string;
    };
    wazuh: {
        url: string;
        token: string;
    };
    webhook: {
        url: string;
        key: string;
    };
    keyRotationDays: number;
    minSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    batchSize: number;
    batchIntervalMs: number;
};
