import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class XpService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Edit XP manual — migrasi dari Cloud Function editXPManual
   */
  async editXPManual(
    targetUserId: string,
    newXP: number,
    reason: string,
    editorId: string,
    editorRole: string,
  ) {
    if (typeof newXP !== 'number' || newXP < 0) {
      throw new BadRequestException('Invalid XP value');
    }
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestException('Reason is required (min 5 characters)');
    }

    const db = this.firebaseService.firestore;
    const userRef = db.collection('users').doc(targetUserId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) throw new NotFoundException('User not found');

    const oldXP = userSnap.data().xpCache || 0;

    await userRef.update({ xpCache: newXP });

    // Catat di xpHistory — immutable
    await db.collection('xpHistory').add({
      userId: targetUserId,
      oldXP,
      newXP,
      change: newXP - oldXP,
      reason: reason.trim(),
      changedBy: editorId,
      changedByRole: editorRole,
      type: 'manual',
      timestamp: this.firebaseService.timestamp,
    });

    await db.collection('logs').add({
      userId: editorId,
      targetUserId,
      action: 'manual_xp_edit',
      result: 'success',
      oldXP,
      newXP,
      reason,
      timestamp: this.firebaseService.timestamp,
    });

    return { success: true, oldXP, newXP };
  }

  /**
   * Ambil XP history untuk user tertentu
   */
  async getXPHistory(userId: string, limit = 30) {
    const db = this.firebaseService.firestore;
    const snapshot = await db
      .collection('xpHistory')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
