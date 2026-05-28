import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { sha256, diffKeys } from '../../common/utils/hash.util';

export interface HistoryEntry {
  historyId:  string;
  userId:     string;
  changedBy:  string;
  action:     string;
  before:     Record<string, unknown>;
  after:      Record<string, unknown>;
  changedFields: string[];
  diffHash:   string;
  timestamp:  string;  // ISO
}

@Injectable()
export class UserHistoryService {
  private readonly logger = new Logger(UserHistoryService.name);

  constructor(private readonly firebase: FirebaseService) {}

  async write(entry: Omit<HistoryEntry, 'historyId' | 'diffHash' | 'timestamp'>): Promise<string> {
    try {
      const diffHash  = sha256(JSON.stringify(entry.before) + JSON.stringify(entry.after));
      const timestamp = new Date().toISOString();
      const ref = await this.firebase.firestore
        .collection('user_history')
        .add({ ...entry, diffHash, timestamp, serverTs: this.firebase.timestamp });
      return ref.id;
    } catch (err) {
      this.logger.error('UserHistory write failed', err);
      return '';
    }
  }

  async getByUser(userId: string, limit = 20): Promise<HistoryEntry[]> {
    try {
      const snap = await this.firebase.firestore
        .collection('user_history')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(Math.min(limit, 100))
        .get();
      return snap.docs.map(d => ({ historyId: d.id, ...d.data() } as HistoryEntry));
    } catch { return []; }
  }

  async getRecent(limit = 50): Promise<HistoryEntry[]> {
    try {
      const snap = await this.firebase.firestore
        .collection('user_history')
        .orderBy('timestamp', 'desc')
        .limit(Math.min(limit, 200))
        .get();
      return snap.docs.map(d => ({ historyId: d.id, ...d.data() } as HistoryEntry));
    } catch { return []; }
  }
}
