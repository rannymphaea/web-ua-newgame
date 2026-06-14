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

  /**
   * XP Decay / Season Reset
   * Reduces all active users' XP by a percentage (default 30%).
   * Called at the start of a new season by admin.
   * Records history for each affected user.
   */
  async seasonReset(decayPercent: number, executedBy: string) {
    if (decayPercent < 0 || decayPercent > 100) {
      throw new BadRequestException('Decay percent harus antara 0-100');
    }

    const db = this.firebaseService.firestore;
    const usersSnap = await db.collection('users')
      .where('status', '==', 'active')
      .get();

    const decayFactor = 1 - (decayPercent / 100);
    let affected = 0;

    for (const doc of usersSnap.docs) {
      const oldXP = doc.data().xpCache || 0;
      if (oldXP <= 0) continue;

      const newXP = Math.floor(oldXP * decayFactor);

      await doc.ref.update({ xpCache: newXP });
      await db.collection('xpHistory').add({
        userId: doc.id,
        oldXP,
        newXP,
        change: newXP - oldXP,
        reason: `Season reset (${decayPercent}% decay)`,
        changedBy: executedBy,
        changedByRole: 'system',
        type: 'season_reset',
        timestamp: this.firebaseService.timestamp,
      });
      affected++;
    }

    // Log the season reset event
    await db.collection('logs').add({
      userId: executedBy,
      action: 'season_reset',
      result: 'success',
      decayPercent,
      affectedUsers: affected,
      timestamp: this.firebaseService.timestamp,
    });

    return { success: true, affected, decayPercent };
  }

  /**
   * Bonus XP for Attendance Streaks
   * Awards bonus XP based on consecutive attendance days.
   * Streak thresholds:
   *   3 consecutive  → +10 XP
   *   7 consecutive  → +25 XP
   *  14 consecutive  → +50 XP
   *  30 consecutive  → +100 XP
   */
  async awardStreakBonus(userId: string) {
    const db = this.firebaseService.firestore;
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) return { awarded: false, reason: 'User not found' };

    const streak = userSnap.data().streak || 0;
    const currentXP = userSnap.data().xpCache || 0;

    // Define streak bonus tiers
    const tiers = [
      { threshold: 30, bonus: 100, label: '30 hari berturut-turut' },
      { threshold: 14, bonus: 50,  label: '14 hari berturut-turut' },
      { threshold: 7,  bonus: 25,  label: '7 hari berturut-turut' },
      { threshold: 3,  bonus: 10,  label: '3 hari berturut-turut' },
    ];

    // Find the highest applicable tier
    const applicableTier = tiers.find(t => streak > 0 && streak % t.threshold === 0);
    if (!applicableTier) return { awarded: false, streak, reason: 'Belum mencapai milestone streak' };

    const newXP = currentXP + applicableTier.bonus;
    await userRef.update({ xpCache: newXP });

    await db.collection('xpHistory').add({
      userId,
      oldXP: currentXP,
      newXP,
      change: applicableTier.bonus,
      reason: `Streak bonus: ${applicableTier.label} (+${applicableTier.bonus} XP)`,
      changedBy: 'system',
      changedByRole: 'system',
      type: 'streak_bonus',
      timestamp: this.firebaseService.timestamp,
    });

    return {
      awarded: true,
      streak,
      bonus: applicableTier.bonus,
      label: applicableTier.label,
      oldXP: currentXP,
      newXP,
    };
  }
}
