import { OnModuleInit } from '@nestjs/common';
import { AlertService } from '../alerts/alert.service';
import { SiemService } from '../siem/siem.service';
export interface RequestFeatures {
    request_rate: number;
    payload_size: number;
    endpoint_diversity: number;
    error_rate: number;
    time_pattern: number;
    threat_score: number;
    ua_entropy: number;
    param_count: number;
}
export interface AnomalyResult {
    is_anomaly: boolean;
    anomaly_score: number;
    threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    action: 'allow' | 'challenge' | 'block';
    reason: string;
}
export declare class AnomalyEngineService implements OnModuleInit {
    private readonly alertService;
    private readonly siemService;
    private forest;
    private readonly trainingBuffer;
    private readonly MIN_TRAINING_SAMPLES;
    private trained;
    constructor(alertService: AlertService, siemService: SiemService);
    onModuleInit(): void;
    analyze(features: RequestFeatures, context: {
        ip: string;
        url: string;
        request_id: string;
    }): AnomalyResult;
    private updateModel;
    private cleanupBuffer;
    private seedBaseline;
    private featuresToArray;
}
