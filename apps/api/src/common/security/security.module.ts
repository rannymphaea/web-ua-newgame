import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ForensicMiddleware } from './forensic.middleware';
import { ForensicLoggerMiddleware } from './forensic-logger.middleware';
import { FingerprintService } from './fingerprint.service';
import { ThreatScoringService } from './threat-scoring.service';
import { AnomalyEngineService } from './ai/anomaly-engine.service';
import { SiemService } from './siem/siem.service';
import { AlertService } from './alerts/alert.service';
import { EvidenceChainService } from './forensic/evidence-chain.service';
import { RequestReplayGuard } from './request-replay.guard';

/**
 * SecurityModule — Unified security module for NestJS
 *
 * Register in AppModule:
 *   imports: [SecurityModule]
 *
 * Middleware order (applied to ALL routes):
 *   1. ForensicMiddleware     — fingerprint, threat score, block decision
 *   2. ForensicLoggerMiddleware — API abuse, sequence tracking, file hash
 *
 * Guards (apply per-route with @UseGuards):
 *   - RequestReplayGuard    — replay attack prevention
 *   - FirebaseAuthGuard     — token verification (existing)
 *   - RolesGuard            — RBAC (existing)
 *
 * Services (inject via constructor):
 *   - AnomalyEngineService  — AI anomaly analysis
 *   - EvidenceChainService  — tamper-evident logging
 *   - SiemService           — SIEM push
 *   - AlertService          — Telegram/Discord/Slack/Email
 */
@Module({
  providers: [
    FingerprintService,
    ThreatScoringService,
    AnomalyEngineService,
    SiemService,
    AlertService,
    EvidenceChainService,
    RequestReplayGuard,
  ],
  exports: [
    FingerprintService,
    ThreatScoringService,
    AnomalyEngineService,
    SiemService,
    AlertService,
    EvidenceChainService,
    RequestReplayGuard,
  ],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ForensicMiddleware, ForensicLoggerMiddleware)
      .forRoutes('*'); // Apply to ALL routes
  }
}
