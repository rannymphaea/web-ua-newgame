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
exports.AnomaliesService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
let AnomaliesService = class AnomaliesService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getAnomalies(filters) {
        const db = this.firebaseService.getFirestore();
        let ref = db.collection('anomalies');
        if (filters?.type) {
            ref = ref.where('type', '==', filters.type);
        }
        if (filters?.resolved !== undefined) {
            ref = ref.where('resolved', '==', filters.resolved);
        }
        ref = ref.orderBy('detectedAt', 'desc').limit(filters?.limit || 50);
        const snap = await ref.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async detectAnomalies(attendanceData) {
        const db = this.firebaseService.getFirestore();
        const anomalies = [];
        const sameDeviceSnap = await db.collection('attendance')
            .where('eventId', '==', attendanceData.eventId)
            .where('deviceFingerprint', '==', attendanceData.deviceFingerprint)
            .get();
        if (sameDeviceSnap.size > 1) {
            anomalies.push({
                type: 'duplicate_device',
                severity: 'high',
                description: `Same device used by ${sameDeviceSnap.size} users for event ${attendanceData.eventId}`,
                userId: attendanceData.userId,
                eventId: attendanceData.eventId,
                deviceFingerprint: attendanceData.deviceFingerprint,
                affectedUsers: sameDeviceSnap.docs.map(d => d.data().userId),
                resolved: false,
                detectedAt: new Date(),
            });
        }
        const recentSnap = await db.collection('attendance')
            .where('userId', '==', attendanceData.userId)
            .orderBy('attendedAt', 'desc')
            .limit(2)
            .get();
        if (recentSnap.size >= 2) {
            const times = recentSnap.docs.map(d => {
                const t = d.data().attendedAt;
                return t.toDate ? t.toDate() : new Date(t.seconds * 1000);
            });
            const diffMs = Math.abs(times[0].getTime() - times[1].getTime());
            if (diffMs < 5 * 60 * 1000) {
                anomalies.push({
                    type: 'rapid_attendance',
                    severity: 'medium',
                    description: `User attended 2 events within ${Math.round(diffMs / 1000)}s`,
                    userId: attendanceData.userId,
                    eventId: attendanceData.eventId,
                    resolved: false,
                    detectedAt: new Date(),
                });
            }
        }
        const batch = db.batch();
        for (const anomaly of anomalies) {
            const ref = db.collection('anomalies').doc();
            batch.set(ref, anomaly);
        }
        if (anomalies.length > 0) {
            await batch.commit();
        }
        return anomalies;
    }
    async resolveAnomaly(anomalyId, adminId, note) {
        const db = this.firebaseService.getFirestore();
        await db.collection('anomalies').doc(anomalyId).update({
            resolved: true,
            resolvedBy: adminId,
            resolvedNote: note || '',
            resolvedAt: new Date(),
        });
        return { message: 'Anomaly resolved' };
    }
};
exports.AnomaliesService = AnomaliesService;
exports.AnomaliesService = AnomaliesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], AnomaliesService);
//# sourceMappingURL=anomalies.service.js.map