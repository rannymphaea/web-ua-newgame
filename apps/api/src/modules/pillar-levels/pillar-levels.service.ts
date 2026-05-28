import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { PILLARS, PILLAR_LEVELS } from './pillar-definitions';

@Injectable()
export class PillarLevelsService {
  constructor(private firebaseService: FirebaseService) {}

  getDefinitions() {
    return { pillars: PILLARS, levels: PILLAR_LEVELS };
  }

  async getUserPillarLevel(userId: string) {
    const db = this.firebaseService.firestore;
    const snap = await db.collection('user_pillar_levels').where('userId', '==', userId).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Assign level ke member (oleh admin/Presiden Pixel)
  async assignLevel(userId: string, pillarId: string, level: number, assignedBy: string) {
    const db = this.firebaseService.firestore;
    const existing = await db.collection('user_pillar_levels')
      .where('userId', '==', userId)
      .where('pillarId', '==', pillarId)
      .get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({ level, updatedAt: this.firebaseService.timestamp, assignedBy });
    } else {
      await db.collection('user_pillar_levels').add({
        userId, pillarId, level, assignedBy,
        assignedAt: this.firebaseService.timestamp,
        updatedAt: this.firebaseService.timestamp,
      });
    }
    return { success: true };
  }

  async getAllMemberLevels() {
    const db = this.firebaseService.firestore;
    const snap = await db.collection('user_pillar_levels').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}
