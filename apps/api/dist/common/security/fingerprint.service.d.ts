export interface FingerprintInput {
    ip: string;
    ja3: string;
    userAgent: string;
    acceptLang: string;
    acceptEncoding: string;
    accept: string;
}
export declare class FingerprintService {
    private readonly sessionSignatures;
    generate(input: FingerprintInput): string;
    trackSession(ip: string, fingerprint: string): {
        changed: boolean;
        count: number;
    };
    private normalizeIP;
    private normalizeUA;
    private normalizeAccept;
    private normalizeAcceptLang;
    private normalizeAcceptEncoding;
}
