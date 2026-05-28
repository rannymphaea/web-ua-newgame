import { Injectable, OnModuleInit } from '@nestjs/common';
import { IsolationForest } from './isolation-forest';
import { AlertService } from '../alerts/alert.service';
import { SiemService } from '../siem/siem.service';

export interface RequestFeatures {
  request_rate: number;        // requests per minute from this IP
  payload_size: number;        // bytes
  endpoint_diversity: number;  // unique endpoints in last 60s
  error_rate: number;          // error responses ratio (0–1)
  time_pattern: number;        // seconds since midnight (0–86400)
  threat_score: number;        // from ThreatScoringService (0–100)
  ua_entropy: number;          // Shannon entropy of User-Agent string
  param_count: number;         // number of query/body parameters
}

export interface AnomalyResult {
  is_anomaly: boolean;
  anomaly_score: number;  // -1.0 (normal) to 1.0 (anomaly)
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'allow' | 'challenge' | 'block';
  reason: string;
}

/**
 * AnomalyEngineService — AI Adaptive Cyber-Defense Engine
 *
 * Implementation: Isolation Forest (unsupervised anomaly detection)
 * Training: Online — updates model incrementally each batch
 *
 * Decision boundaries:
 *   anomaly_score > 0.7  → CRITICAL → block
 *   anomaly_score > 0.5  → HIGH     → challenge
 *   anomaly_score > 0.3  → MEDIUM   → log + monitor
 *   anomaly_score <= 0.3 → LOW      → allow
 *
 * Principles:
 *   - NO attack-back / NO hack-back
 *   - Only block, challenge, log, and alert
 *   - All decisions logged for forensic audit
 */
@Injectable()
export class AnomalyEngineService implements OnModuleInit {
  private forest!: IsolationForest;
  private readonly trainingBuffer: RequestFeatures[] = [];
  private readonly MIN_TRAINING_SAMPLES = 200;
  private trained = false;

  constructor(
    private readonly alertService: AlertService,
    private readonly siemService: SiemService,
  ) {}

  onModuleInit(): void {
    // Initialize forest with default params
    this.forest = new IsolationForest({ numTrees: 100, sampleSize: 256 });

    // Seed with baseline "normal" traffic profiles
    this.seedBaseline();

    // Periodic model update every 15 minutes
    setInterval(() => this.updateModel(), 15 * 60 * 1000);

    // Periodic cleanup every 10 minutes
    setInterval(() => this.cleanupBuffer(), 10 * 60 * 1000);
  }

  /**
   * Analyze a request and return anomaly decision.
   * This is the main entry point called by ForensicMiddleware.
   */
  analyze(features: RequestFeatures, context: { ip: string; url: string; request_id: string }): AnomalyResult {
    // Add to training buffer
    this.trainingBuffer.push(features);

    // Compute anomaly score
    const rawScore = this.trained
      ? this.forest.anomalyScore(this.featuresToArray(features))
      : 0.1; // Default to low while untrained

    // Normalize to 0–1
    const anomalyScore = Math.max(0, Math.min(1, rawScore));

    // ── Decision logic ────────────────────────────────────────────────────
    let threatLevel: AnomalyResult['threat_level'] = 'LOW';
    let action: AnomalyResult['action'] = 'allow';
    let reason = 'Normal behavioral pattern';

    if (anomalyScore > 0.7) {
      threatLevel = 'CRITICAL'; action = 'block';
      reason = `Critical anomaly score: ${anomalyScore.toFixed(3)}`;
    } else if (anomalyScore > 0.5) {
      threatLevel = 'HIGH'; action = 'challenge';
      reason = `High anomaly score: ${anomalyScore.toFixed(3)}`;
    } else if (anomalyScore > 0.3) {
      threatLevel = 'MEDIUM'; action = 'allow';
      reason = `Elevated anomaly score: ${anomalyScore.toFixed(3)}`;
    }

    const result: AnomalyResult = {
      is_anomaly: anomalyScore > 0.3,
      anomaly_score: anomalyScore,
      threat_level: threatLevel,
      action,
      reason,
    };

    // ── Emit to SIEM ──────────────────────────────────────────────────────
    if (result.is_anomaly) {
      const siemEvent = {
        type: 'AI_ANOMALY_DETECTED',
        timestamp: new Date().toISOString(),
        ...context,
        ...result,
        features,
      };
      this.siemService.emit(siemEvent).catch(() => {});

      // Alert on HIGH / CRITICAL
      if (threatLevel === 'HIGH' || threatLevel === 'CRITICAL') {
        this.alertService.send({
          severity: threatLevel,
          title: `AI Anomaly Detected: ${threatLevel}`,
          ip: context.ip,
          url: context.url,
          fingerprint: context.request_id,
          attemptType: `Anomaly Score ${anomalyScore.toFixed(3)}`,
          details: reason,
        }).catch(() => {});
      }
    }

    // ── Audit log ─────────────────────────────────────────────────────────
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

  /** Retrain model with recent request buffer */
  private updateModel(): void {
    if (this.trainingBuffer.length < this.MIN_TRAINING_SAMPLES) return;

    const data = this.trainingBuffer
      .slice(-2000) // Use last 2000 samples
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

  /** Keep buffer bounded to 5000 samples */
  private cleanupBuffer(): void {
    if (this.trainingBuffer.length > 5000) {
      this.trainingBuffer.splice(0, this.trainingBuffer.length - 5000);
    }
  }

  /** Seed with baseline normal traffic profiles to bootstrap model */
  private seedBaseline(): void {
    const baseline: RequestFeatures[] = [];
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

  private featuresToArray(f: RequestFeatures): number[] {
    return [
      f.request_rate / 120,          // normalize to 0–1 (max 120/min)
      f.payload_size / 10485760,     // normalize to 0–1 (max 10MB)
      f.endpoint_diversity / 100,    // normalize
      f.error_rate,                  // already 0–1
      f.time_pattern / 86400,        // normalize to 0–1
      f.threat_score / 100,          // already 0–1
      f.ua_entropy / 8,              // normalize (max ~8 bits)
      f.param_count / 50,            // normalize
    ];
  }
}
