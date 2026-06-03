import { AnomaliesService } from './anomalies.service';
export declare class AnomaliesController {
    private anomaliesService;
    constructor(anomaliesService: AnomaliesService);
    getAnomalies(type?: string, resolved?: string, limit?: string): Promise<{
        id: string;
    }[]>;
    resolveAnomaly(id: string, user: any, body: {
        note?: string;
    }): Promise<{
        message: string;
    }>;
}
