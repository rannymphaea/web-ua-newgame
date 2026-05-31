export declare const siemConfig: {
    elastic: {
        url: any;
        apiKey: any;
        index: any;
    };
    loki: {
        url: any;
        user: any;
        pass: any;
    };
    splunk: {
        url: any;
        token: any;
    };
    wazuh: {
        url: any;
        token: any;
    };
    webhook: {
        url: any;
        key: any;
    };
    keyRotationDays: number;
    minSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    batchSize: number;
    batchIntervalMs: number;
};
