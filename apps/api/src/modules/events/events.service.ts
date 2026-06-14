import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class EventsService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Buat event baru
   */
  async createEvent(creatorId: string, data: {
    name: string;
    description?: string;
    xpReward?: number;
    xpPenalty?: number;
    recurring?: { type: 'weekly' | 'biweekly' | 'monthly'; dayOfWeek?: number; endDate?: string };
    scheduledDate?: string;
  }) {
    const db = this.firebaseService.firestore;
    const eventRef = db.collection('events').doc();

    const eventData: Record<string, any> = {
      name: data.name,
      description: data.description || '',
      xpReward: data.xpReward || 10,
      xpPenalty: data.xpPenalty || 5,
      status: 'active',
      createdBy: creatorId,
      startTime: data.scheduledDate ? new Date(data.scheduledDate) : this.firebaseService.timestamp,
      endTime: null,
      closedBy: null,
      xpDistributed: false,
      isRecurring: !!data.recurring,
      recurrence: data.recurring || null,
      createdAt: this.firebaseService.timestamp,
    };

    await eventRef.set(eventData);

    // If recurring, generate future event instances (max 12)
    const generatedIds: string[] = [eventRef.id];
    if (data.recurring) {
      const intervalDays = data.recurring.type === 'weekly' ? 7 : data.recurring.type === 'biweekly' ? 14 : 30;
      const endDate = data.recurring.endDate ? new Date(data.recurring.endDate) : new Date(Date.now() + 90 * 86400000);
      const baseDate = data.scheduledDate ? new Date(data.scheduledDate) : new Date();
      
      for (let i = 1; i <= 12; i++) {
        const nextDate = new Date(baseDate.getTime() + i * intervalDays * 86400000);
        if (nextDate > endDate) break;
        
        const recurRef = db.collection('events').doc();
        await recurRef.set({
          ...eventData,
          startTime: nextDate,
          parentEventId: eventRef.id,
          recurrenceIndex: i,
          name: `${data.name} #${i + 1}`,
          createdAt: this.firebaseService.timestamp,
        });
        generatedIds.push(recurRef.id);
      }
    }

    await db.collection('logs').add({
      userId: creatorId,
      eventId: eventRef.id,
      action: 'create_event',
      result: 'success',
      recurring: !!data.recurring,
      generatedCount: generatedIds.length,
      timestamp: this.firebaseService.timestamp,
    });

    return { success: true, eventId: eventRef.id, generatedIds };
  }

  /**
   * List semua events
   */
  async getEvents(status?: string, limit = 20) {
    const db = this.firebaseService.firestore;
    let query: any = db.collection('events').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.limit(limit).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Generate QR token — migrasi dari Cloud Function generateToken
   */
  async generateToken(eventId: string, creatorId: string) {
    const db = this.firebaseService.firestore;

    // Validasi event aktif
    const eventSnap = await db.collection('events').doc(eventId).get();
    if (!eventSnap.exists || eventSnap.data().status !== 'active') {
      throw new BadRequestException('Event is not active');
    }

    // Invalidate token lama untuk event ini
    const oldTokens = await db
      .collection('tokens')
      .where('eventId', '==', eventId)
      .where('used', '==', false)
      .get();

    const invalidateBatch = db.batch();
    oldTokens.docs.forEach((doc) => {
      invalidateBatch.update(doc.ref, {
        used: true,
        invalidatedAt: this.firebaseService.timestamp,
      });
    });
    await invalidateBatch.commit();

    // Generate token baru
    const tokenId = this.generateSecureToken();
    const now = this.firebaseService.timestampNow;
    const expiresAt = this.firebaseService.createTimestamp(now.seconds + 12, now.nanoseconds);

    await db.collection('tokens').doc(tokenId).set({
      tokenId,
      eventId,
      createdAt: this.firebaseService.timestamp,
      expiresAt,
      used: false,
      usedBy: null,
      deviceFingerprint: null,
      createdBy: creatorId,
    });

    return { success: true, tokenId, expiresAt: expiresAt.toMillis() };
  }

  /**
   * Tutup event dan distribusi XP — migrasi dari Cloud Function closeEvent
   */
  async closeEvent(eventId: string, requesterId: string, requesterRole: string, approverId?: string) {
    const db = this.firebaseService.firestore;

    const eventRef = db.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) throw new NotFoundException('Event not found');
    const event = eventSnap.data();
    if (event.status !== 'active') throw new BadRequestException('Event is not active');

    // Double approval untuk admin biasa
    if (requesterRole === 'admin') {
      if (!approverId || approverId === requesterId) {
        throw new ForbiddenException('Requires approval from another admin');
      }
    }

    // Tutup event
    await eventRef.update({
      status: 'closed',
      endTime: this.firebaseService.timestamp,
      closedBy: requesterId,
      xpDistributed: false,
    });

    // Ambil semua user aktif
    const usersSnap = await db
      .collection('users')
      .where('status', 'in', ['active', 'npc'])
      .get();

    // Ambil semua yang sudah hadir
    const attendanceSnap = await db
      .collection('attendance')
      .where('eventId', '==', eventId)
      .get();

    const presentUserIds = new Set(attendanceSnap.docs.map((d) => d.data().userId));

    // Distribusi XP per user (penalti absent)
    const batch = db.batch();

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Skip user yang daftar setelah event mulai
      if (userData.createdAt && event.startTime) {
        if (userData.createdAt.toMillis() > event.startTime.toMillis()) continue;
      }

      const isPresent = presentUserIds.has(userId);

      if (!isPresent) {
        const xpPenalty = event.xpPenalty || 5;
        const currentXP = userData.xpCache || 0;
        const newXP = Math.max(0, currentXP - xpPenalty);

        batch.update(db.collection('users').doc(userId), { xpCache: newXP });

        const attendanceId = `${eventId}_${userId}`;
        batch.set(db.collection('attendance').doc(attendanceId), {
          eventId,
          eventName: event.name,
          userId,
          status: 'absent',
          xpChange: -xpPenalty,
          attendedAt: this.firebaseService.timestamp,
        });

        batch.set(db.collection('xpHistory').doc(), {
          userId,
          eventId,
          change: -xpPenalty,
          reason: 'absent',
          changedBy: 'system',
          timestamp: this.firebaseService.timestamp,
        });
      }
    }

    await batch.commit();
    await eventRef.update({ xpDistributed: true });

    await db.collection('logs').add({
      userId: requesterId,
      eventId,
      action: 'close_event',
      result: 'success',
      timestamp: this.firebaseService.timestamp,
    });

    return { success: true, message: 'Event closed successfully' };
  }

  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }
}
