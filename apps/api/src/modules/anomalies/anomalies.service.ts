import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class AnomaliesService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Get anomalies — suspicious attendance patterns
   */
  async getAnomalies(filters?: {
    type?: string;
    resolved?: boolean;
    limit?: number;
  }) {
    const db = this.firebaseService.getFirestore();
    let ref: FirebaseFirestore.Query = db.collection('anomalies');

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

  /**
   * Detect anomalies — called after attendance processing
   */
  async detectAnomalies(attendanceData: {
    userId: string;
    eventId: string;
    deviceFingerprint: string;
    attendedAt: Date;
  }) {
    const db = this.firebaseService.getFirestore();
    const anomalies: any[] = [];

    // Check 1: Same device fingerprint used by multiple users in same event
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

    // Check 2: Rapid successive attendances (< 5 minutes apart)
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

    // Save anomalies
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

  /**
   * Resolve an anomaly
   */
  async resolveAnomaly(anomalyId: string, adminId: string, note?: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('anomalies').doc(anomalyId).update({
      resolved: true,
      resolvedBy: adminId,
      resolvedNote: note || '',
      resolvedAt: new Date(),
    });
    return { message: 'Anomaly resolved' };
  }
}
