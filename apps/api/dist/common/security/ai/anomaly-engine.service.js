"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomalyEngineService = void 0;
const common_1 = require("@nestjs/common");
const isolation_forest_1 = require("./isolation-forest");
const alert_service_1 = require("../alerts/alert.service");
const siem_service_1 = require("../siem/siem.service");
let AnomalyEngineService = class AnomalyEngineService {
    constructor(alertService, siemService) {
        this.alertService = alertService;
        this.siemService = siemService;
        this.trainingBuffer = [];
        this.MIN_TRAINING_SAMPLES = 200;
        this.trained = false;
    }
    onModuleInit() {
        this.forest = new isolation_forest_1.IsolationForest({ numTrees: 100, sampleSize: 256 });
        this.seedBaseline();
        setInterval(() => this.updateModel(), 15 * 60 * 1000);
        setInterval(() => this.cleanupBuffer(), 10 * 60 * 1000);
    }
    analyze(features, context) {
        this.trainingBuffer.push(features);
        const rawScore = this.trained
            ? this.forest.anomalyScore(this.featuresToArray(features))
            : 0.1;
        const anomalyScore = Math.max(0, Math.min(1, rawScore));
        let threatLevel = 'LOW';
        let action = 'allow';
        let reason = 'Normal behavioral pattern';
        if (anomalyScore > 0.7) {
            threatLevel = 'CRITICAL';
            action = 'block';
            reason = `Critical anomaly score: ${anomalyScore.toFixed(3)}`;
        }
        else if (anomalyScore > 0.5) {
            threatLevel = 'HIGH';
            action = 'challenge';
            reason = `High anomaly score: ${anomalyScore.toFixed(3)}`;
        }
        else if (anomalyScore > 0.3) {
            threatLevel = 'MEDIUM';
            action = 'allow';
            reason = `Elevated anomaly score: ${anomalyScore.toFixed(3)}`;
        }
        const result = {
            is_anomaly: anomalyScore > 0.3,
            anomaly_score: anomalyScore,
            threat_level: threatLevel,
            action,
            reason,
        };
        if (result.is_anomaly) {
            const siemEvent = {
                type: 'AI_ANOMALY_DETECTED',
                timestamp: new Date().toISOString(),
                ...context,
                ...result,
                features,
            };
            this.siemService.emit(siemEvent).catch(() => { });
            if (threatLevel === 'HIGH' || threatLevel === 'CRITICAL') {
                this.alertService.send({
                    severity: threatLevel,
                    title: `AI Anomaly Detected: ${threatLevel}`,
                    ip: context.ip,
                    url: context.url,
                    fingerprint: context.request_id,
                    attemptType: `Anomaly Score ${anomalyScore.toFixed(3)}`,
                    details: reason,
                }).catch(() => { });
            }
        }
        process.stdout.write(JSON.stringify({
            type: 'AI_ANALYSIS',
            timestamp: new Date().toISOString(),
            request_id: context.request_id,
            ip: context.ip,
            anomaly_score: anomalyScore,
            threat_level: threatLevel,
            action,
            reason,
            model_trained: this.trained,
        }) + '\n');
        return result;
    }
    updateModel() {
        if (this.trainingBuffer.length < this.MIN_TRAINING_SAMPLES)
            return;
        const data = this.trainingBuffer
            .slice(-2000)
            .map(f => this.featuresToArray(f));
        this.forest.fit(data);
        this.trained = true;
        process.stdout.write(JSON.stringify({
            type: 'AI_MODEL_UPDATED',
            timestamp: new Date().toISOString(),
            samples_used: data.length,
            buffer_size: this.trainingBuffer.length,
        }) + '\n');
    }
    cleanupBuffer() {
        if (this.trainingBuffer.length > 5000) {
            this.trainingBuffer.splice(0, this.trainingBuffer.length - 5000);
        }
    }
    seedBaseline() {
        const baseline = [];
        for (let i = 0; i < this.MIN_TRAINING_SAMPLES; i++) {
            baseline.push({
                request_rate: 2 + Math.random() * 8,
                payload_size: 100 + Math.random() * 2000,
                endpoint_diversity: 1 + Math.floor(Math.random() * 5),
                error_rate: Math.random() * 0.1,
                time_pattern: Math.random() * 86400,
                threat_score: Math.random() * 10,
                ua_entropy: 3.5 + Math.random() * 1.5,
                param_count: Math.floor(Math.random() * 8),
            });
        }
        this.trainingBuffer.push(...baseline);
        this.updateModel();
    }
    featuresToArray(f) {
        return [
            f.request_rate / 120,
            f.payload_size / 10485760,
            f.endpoint_diversity / 100,
            f.error_rate,
            f.time_pattern / 86400,
            f.threat_score / 100,
            f.ua_entropy / 8,
            f.param_count / 50,
        ];
    }
};
exports.AnomalyEngineService = AnomalyEngineService;
exports.AnomalyEngineService = AnomalyEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alert_service_1.AlertService,
        siem_service_1.SiemService])
], AnomalyEngineService);
//# sourceMappingURL=anomaly-engine.service.js.map