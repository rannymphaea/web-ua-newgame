import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { BADGES, BADGE_RARITIES, BADGE_CATEGORIES } from './badge-definitions';

@Injectable()
export class BadgesService {
  constructor(private firebaseService: FirebaseService) {}

  getDefinitions() {
    return { badges: BADGES, rarities: BADGE_RARITIES, categories: BADGE_CATEGORIES };
  }

  async getUserBadges(userId: string) {
    const db = this.firebaseService.firestore;
    const snap = await db.collection('user_badges').where('userId', '==', userId).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Check and award auto badges based on user stats
  async checkAndAward(userId: string) {
    const db = this.firebaseService.firestore;
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) return [];

    const user = userSnap.data();
    const existing = await this.getUserBadges(userId);
    const existingIds = existing.map((b: any) => b.badgeId);
    const awarded: string[] = [];

    const stats: Record<string, number> = {
      attendanceCount: user.attendanceCount || 0,
      streak: user.streak || 0,
      xpCache: user.xpCache || 0,
      level: Math.floor((user.xpCache || 0) / 100) + 1,
      hasLoggedIn: 1,
      profileComplete: (user.username && user.photoURL) ? 1 : 0,
    };

    for (const badge of BADGES) {
      if (badge.condition.type !== 'auto') continue;
      if (existingIds.includes(badge.id)) continue;
      if (!badge.condition.check || !badge.condition.value) continue;

      const userVal = stats[badge.condition.check] || 0;
      // For leaderboardRank, lower is better
      if (badge.condition.check === 'leaderboardRank') continue; // checked separately

      if (userVal >= badge.condition.value) {
        await db.collection('user_badges').add({
          userId,
          badgeId: badge.id,
          awardedAt: this.firebaseService.timestamp,
          source: 'auto',
        });
        awarded.push(badge.id);
      }
    }

    return awarded;
  }

  // Manually award a badge (by admin/Presiden Pixel)
  async awardBadge(userId: string, badgeId: string, awardedBy: string) {
    const db = this.firebaseService.firestore;
    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) throw new Error('Badge not found');

    const existing = await db.collection('user_badges')
      .where('userId', '==', userId)
      .where('badgeId', '==', badgeId)
      .get();
    if (!existing.empty) throw new Error('Badge already awarded');

    await db.collection('user_badges').add({
      userId,
      badgeId,
      awardedAt: this.firebaseService.timestamp,
      awardedBy,
      source: 'manual',
    });

    return { success: true, badge: badge.name };
  }

  // Revoke a badge
  async revokeBadge(userId: string, badgeId: string) {
    const db = this.firebaseService.firestore;
    const snap = await db.collection('user_badges')
      .where('userId', '==', userId)
      .where('badgeId', '==', badgeId)
      .get();
    for (const doc of snap.docs) {
      await doc.ref.delete();
    }
    return { success: true };
  }
}
