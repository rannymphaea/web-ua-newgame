import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class LogsService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Get system logs with filters
   */
  async getLogs(filters?: {
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const db = this.firebaseService.getFirestore();
    let ref: FirebaseFirestore.Query = db.collection('logs');

    if (filters?.action) {
      ref = ref.where('action', '==', filters.action);
    }
    if (filters?.userId) {
      ref = ref.where('userId', '==', filters.userId);
    }
    if (filters?.startDate) {
      ref = ref.where('timestamp', '>=', new Date(filters.startDate));
    }
    if (filters?.endDate) {
      ref = ref.where('timestamp', '<=', new Date(filters.endDate));
    }

    ref = ref.orderBy('timestamp', 'desc').limit(filters?.limit || 100);

    if (filters?.offset) {
      ref = ref.offset(filters.offset);
    }

    const snap = await ref.get();
    return {
      logs: snap.docs.map(d => ({ id: d.id, ...d.data() })),
      total: snap.size,
    };
  }

  /**
   * Create a log entry
   */
  async createLog(data: {
    userId: string;
    action: string;
    details?: Record<string, any>;
    result?: string;
    targetUserId?: string;
    eventId?: string;
  }) {
    const db = this.firebaseService.getFirestore();
    const logRef = db.collection('logs').doc();
    await logRef.set({
      ...data,
      timestamp: new Date(),
    });
    return { id: logRef.id };
  }

  /**
   * Export logs as JSON
   */
  async exportLogs(filters?: {
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const db = this.firebaseService.getFirestore();
    let ref: FirebaseFirestore.Query = db.collection('logs');

    if (filters?.action) {
      ref = ref.where('action', '==', filters.action);
    }
    if (filters?.startDate) {
      ref = ref.where('timestamp', '>=', new Date(filters.startDate));
    }
    if (filters?.endDate) {
      ref = ref.where('timestamp', '<=', new Date(filters.endDate));
    }

    ref = ref.orderBy('timestamp', 'desc');
    const snap = await ref.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}
