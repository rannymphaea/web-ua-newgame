"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const forensic_middleware_1 = require("./forensic.middleware");
const forensic_logger_middleware_1 = require("./forensic-logger.middleware");
const fingerprint_service_1 = require("./fingerprint.service");
const threat_scoring_service_1 = require("./threat-scoring.service");
const anomaly_engine_service_1 = require("./ai/anomaly-engine.service");
const siem_service_1 = require("./siem/siem.service");
const alert_service_1 = require("./alerts/alert.service");
const evidence_chain_service_1 = require("./forensic/evidence-chain.service");
const request_replay_guard_1 = require("./request-replay.guard");
let SecurityModule = class SecurityModule {
    configure(consumer) {
        consumer
            .apply(forensic_middleware_1.ForensicMiddleware, forensic_logger_middleware_1.ForensicLoggerMiddleware)
            .forRoutes('*');
    }
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        providers: [
            fingerprint_service_1.FingerprintService,
            threat_scoring_service_1.ThreatScoringService,
            anomaly_engine_service_1.AnomalyEngineService,
            siem_service_1.SiemService,
            alert_service_1.AlertService,
            evidence_chain_service_1.EvidenceChainService,
            request_replay_guard_1.RequestReplayGuard,
        ],
        exports: [
            fingerprint_service_1.FingerprintService,
            threat_scoring_service_1.ThreatScoringService,
            anomaly_engine_service_1.AnomalyEngineService,
            siem_service_1.SiemService,
            alert_service_1.AlertService,
            evidence_chain_service_1.EvidenceChainService,
            request_replay_guard_1.RequestReplayGuard,
        ],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map