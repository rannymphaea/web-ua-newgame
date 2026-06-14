import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class AttendanceService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Proses absensi — migrasi dari Cloud Function processAttendance.
   * Semua validasi + write dilakukan dalam satu Firestore transaction.
   */
  async processAttendance(userId: string, tokenId: string, deviceFingerprint: string) {
    if (!tokenId || !deviceFingerprint) {
      throw new BadRequestException('Missing required fields');
    }

    const db = this.firebaseService.firestore;

    try {
      const result = await db.runTransaction(async (transaction) => {
        const tokenRef = db.collection('tokens').doc(tokenId);
        const userRef = db.collection('users').doc(userId);

        const [tokenSnap, userSnap] = await Promise.all([
          transaction.get(tokenRef),
          transaction.get(userRef),
        ]);

        // Validasi token
        if (!tokenSnap.exists) throw new Error('TOKEN_NOT_FOUND');
        const token = tokenSnap.data();
        if (token.used) throw new Error('TOKEN_USED');

        // Validasi expired menggunakan waktu server
        const now = this.firebaseService.timestampNow;
        if (now.toMillis() > token.expiresAt.toMillis()) {
          throw new Error('TOKEN_EXPIRED');
        }

        // Validasi device binding
        if (token.deviceFingerprint && token.deviceFingerprint !== deviceFingerprint) {
          throw new Error('DEVICE_MISMATCH');
        }

        // Validasi event
        const eventRef = db.collection('events').doc(token.eventId);
        const eventSnap = await transaction.get(eventRef);
        if (!eventSnap.exists) throw new Error('EVENT_NOT_FOUND');
        const event = eventSnap.data();
        if (event.status !== 'active') throw new Error('EVENT_NOT_ACTIVE');

        // Validasi user
        if (!userSnap.exists) throw new Error('USER_NOT_FOUND');
        const user = userSnap.data();
        if (user.status !== 'active' && user.status !== 'npc') {
          throw new Error('USER_NOT_ACTIVE');
        }

        // Validasi double absen — IDEMPOTENT: kembalikan sukses jika sudah pernah hadir
        const attendanceId = `${token.eventId}_${userId}`;
        const attendanceRef = db.collection('attendance').doc(attendanceId);
        const attendanceSnap = await transaction.get(attendanceRef);
        if (attendanceSnap.exists) {
          return {
            success: true,
            alreadyRecorded: true,
            message: 'Kamu sudah absen di event ini',
            eventName: event.name,
          };
        }

        const xpReward = event.xpReward || 10;
        const currentXP = user.xpCache || 0;
        const currentStreak = user.streak || 0;

        // Hitung streak bonus
        const lastAttended = user.lastAttendedAt;
        let newStreak = 1;
        let streakBonus = 0;

        if (lastAttended) {
          const lastDate = lastAttended.toDate();
          const diffDays = Math.floor(
            (now.toDate().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (diffDays <= 7) {
            newStreak = currentStreak + 1;
            if (newStreak % 5 === 0) streakBonus = 5;
          }
        }

        const totalXP = currentXP + xpReward + streakBonus;

        // Tulis semua sekaligus — atomic
        transaction.update(tokenRef, {
          used: true,
          usedBy: userId,
          usedAt: now,
          deviceFingerprint: deviceFingerprint,
        });

        transaction.set(attendanceRef, {
          eventId: token.eventId,
          eventName: event.name,
          userId: userId,
          status: 'present',
          xpChange: xpReward + streakBonus,
          streakBonus: streakBonus,
          deviceFingerprint: deviceFingerprint,
          attendedAt: now,
        });

        transaction.update(userRef, {
          xpCache: totalXP,
          attendanceCount: (user.attendanceCount || 0) + 1,
          streak: newStreak,
          lastAttendedAt: now,
        });

        return {
          success: true,
          xpGained: xpReward + streakBonus,
          streakBonus,
          newStreak,
          totalXP,
          eventName: event.name,
        };
      });

      // Log sukses di luar transaction
      await db.collection('logs').add({
        userId,
        action: 'attend',
        result: 'success',
        deviceFingerprint,
        timestamp: this.firebaseService.timestamp,
      });

      return result;
    } catch (error) {
      // Log gagal
      await db.collection('logs').add({
        userId,
        action: 'attend',
        result: 'failed',
        reason: error.message,
        timestamp: this.firebaseService.timestamp,
      });

      // Cek anomaly
      await this.checkAnomaly(userId, error.message, deviceFingerprint);

      const errorMessages = {
        TOKEN_NOT_FOUND: 'Invalid QR code',
        TOKEN_USED: 'QR code already used',
        TOKEN_EXPIRED: 'QR code expired',
        DEVICE_MISMATCH: 'Device not recognized',
        EVENT_NOT_FOUND: 'Event not found',
        EVENT_NOT_ACTIVE: 'Event is not active',
        USER_NOT_FOUND: 'Account not found',
        USER_NOT_ACTIVE: 'Account is not active',
        ALREADY_ATTENDED: 'You have already attended this event',
      };

      throw new ForbiddenException(
        errorMessages[error.message] || 'Attendance failed',
      );
    }
  }

  /**
   * Ambil riwayat absensi user
   */
  async getAttendanceHistory(userId: string, limit = 20) {
    const db = this.firebaseService.firestore;
    const snapshot = await db
      .collection('attendance')
      .where('userId', '==', userId)
      .orderBy('attendedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Check if user already attended an event
   */
  async checkAttendance(userId: string, eventId: string) {
    const db = this.firebaseService.firestore;
    const attendanceId = `${eventId}_${userId}`;
    const doc = await db.collection('attendance').doc(attendanceId).get();
    return { attended: doc.exists };
  }

  /**
   * Ambil semua absensi untuk suatu event
   */
  async getEventAttendance(eventId: string) {
    const db = this.firebaseService.firestore;
    const snapshot = await db
      .collection('attendance')
      .where('eventId', '==', eventId)
      .orderBy('attendedAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Cek anomaly — migrasi dari helper checkAnomaly()
   */
  private async checkAnomaly(userId: string, reason: string, deviceFingerprint: string) {
    try {
      const db = this.firebaseService.firestore;
      const now = this.firebaseService.timestampNow;
      const fiveMinutesAgo = this.firebaseService.createTimestamp(now.seconds - 300, 0);

      const recentFails = await db
        .collection('logs')
        .where('userId', '==', userId)
        .where('result', '==', 'failed')
        .where('timestamp', '>', fiveMinutesAgo)
        .get();

      let score = 0;
      const reasons = [reason];

      if (recentFails.size >= 3) { score += 2; reasons.push('multiple_failures'); }
      if (reason === 'DEVICE_MISMATCH') { score += 3; }
      if (reason === 'TOKEN_USED') { score += 3; reasons.push('token_reuse_attempt'); }

      if (score >= 4) {
        await db.collection('anomalies').add({
          userId,
          score,
          reasons,
          deviceFingerprint,
          timestamp: this.firebaseService.timestamp,
        });

        if (score >= 8) {
          await db.collection('users').doc(userId).update({
            status: 'suspended',
            suspendedAt: this.firebaseService.timestamp,
            suspendReason: 'anomaly_detected',
          });
        }
      }
    } catch (error) {
      console.error('Check anomaly error:', error);
    }
  /**
   * Export attendance as CSV
   */
  async exportCsv(opts: { eventId?: string; from?: string; to?: string }) {
    const db = this.firebaseService.firestore;
    let q: FirebaseFirestore.Query = db.collection('attendance');
    if (opts.eventId) q = q.where('eventId', '==', opts.eventId);
    q = q.orderBy('attendedAt', 'desc');

    const snap = await q.get();
    let docs = snap.docs.map(d => ({ id: d.id, ...d.data() as Record<string, any> }));

    // Date range filter
    if (opts.from || opts.to) {
      docs = docs.filter(d => {
        const ts = d.attendedAt?.toDate?.()?.toISOString() || '';
        if (opts.from && ts < opts.from) return false;
        if (opts.to && ts > opts.to) return false;
        return true;
      });
    }

    const headers = ['Event', 'User ID', 'Status', 'XP Gained', 'Streak Bonus', 'Date'];
    const rows = docs.map(d => [
      d.eventName || d.eventId || '', d.userId || '', d.status || 'present',
      d.xpChange || 0, d.streakBonus || 0,
      d.attendedAt?.toDate?.()?.toISOString() || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

    return { csv: [headers.join(','), ...rows].join('\n'), count: docs.length };
  }

  /**
   * Manual attendance input by trainer/admin
   */
  async manualInput(userId: string, eventId: string, adminId: string, status = 'present', notes?: string) {
    const db = this.firebaseService.firestore;

    // Validate user and event exist
    const [userSnap, eventSnap] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('events').doc(eventId).get(),
    ]);
    if (!userSnap.exists) throw new BadRequestException('User tidak ditemukan');
    if (!eventSnap.exists) throw new BadRequestException('Event tidak ditemukan');

    const event = eventSnap.data();
    const user = userSnap.data();
    const attendanceId = `${eventId}_${userId}`;
    const existingSnap = await db.collection('attendance').doc(attendanceId).get();
    if (existingSnap.exists) {
      return { success: true, alreadyRecorded: true, message: 'Sudah tercatat hadir' };
    }

    // Late penalty check: if event has startTime, check if late
    const now = this.firebaseService.timestampNow;
    let latePenalty = 0;
    let isLate = false;
    if (event.startTime && status === 'present') {
      const eventStart = event.startTime.toDate ? event.startTime.toDate() : new Date(event.startTime);
      const lateMinutes = Math.floor((now.toDate().getTime() - eventStart.getTime()) / 60000);
      if (lateMinutes > 15) {
        isLate = true;
        latePenalty = Math.min(Math.floor(lateMinutes / 15) * 2, 10); // -2 XP per 15min late, max -10
        status = 'late';
      }
    }

    const xpReward = Math.max((event.xpReward || 10) - latePenalty, 0);
    const currentXP = user.xpCache || 0;

    const batch = db.batch();

    batch.set(db.collection('attendance').doc(attendanceId), {
      eventId,
      eventName: event.name || '',
      userId,
      status,
      xpChange: xpReward,
      isLate,
      latePenalty,
      notes: notes || '',
      inputBy: adminId,
      inputType: 'manual',
      attendedAt: this.firebaseService.timestamp,
    });

    batch.update(db.collection('users').doc(userId), {
      xpCache: currentXP + xpReward,
      attendanceCount: (user.attendanceCount || 0) + 1,
    });

    batch.set(db.collection('logs').doc(), {
      userId: adminId,
      targetUserId: userId,
      action: 'manual_attendance',
      result: 'success',
      eventId,
      isLate,
      latePenalty,
      notes,
      timestamp: this.firebaseService.timestamp,
    });

    await batch.commit();

    return { success: true, xpGained: xpReward, isLate, latePenalty, status };
  }
}
