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
export declare class AlertService {
    private readonly logger;
    private readonly rateLimitMap;
    private readonly RATE_LIMIT_MS;
    send(payload: AlertPayload): Promise<void>;
    private sendTelegram;
    private sendDiscord;
    private sendSlack;
    private sendEmail;
    private post;
    private formatMessage;
}
