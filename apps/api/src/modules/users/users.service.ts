import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { UserHistoryService } from '../user-history/user-history.service';
import { UserVaultService } from '../user-vault/user-vault.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { diffKeys } from '../../common/utils/hash.util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private firebaseService: FirebaseService,
    private history: UserHistoryService,
    private vault:   UserVaultService,
  ) {}

  async getUserById(userId: string) {
    try {
      const snap = await this.firebaseService.firestore.collection('users').doc(userId).get();
      if (!snap.exists) throw new NotFoundException('User not found');
      return { uid: snap.id, ...snap.data() };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      return { ok: false, error: String(err) };
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (!userId) throw new BadRequestException('userId required');
    const db  = this.firebaseService.firestore;
    const ref = db.collection('users').doc(userId);

    try {
      const snap = await ref.get();
      if (!snap.exists) throw new NotFoundException('User not found');
      const before = snap.data() as Record<string, unknown>;

      const patch: Record<string, unknown> = {};
      if (dto.displayName !== undefined) patch.name     = String(dto.displayName).trim().slice(0, 80);
      if (dto.username    !== undefined) patch.username = String(dto.username).trim().toLowerCase().slice(0, 40);
      if (dto.photoURL    !== undefined) {
        const url = String(dto.photoURL).trim();
        if (url && !url.startsWith('http')) throw new BadRequestException('photoURL must be a valid URL');
        patch.photoURL = url;
      }
      if (!Object.keys(patch).length) return { ok: true, message: 'No changes' };
      patch.updatedAt = new Date().toISOString();

      await ref.update({ ...patch, serverTs: this.firebaseService.timestamp });

      const after = { ...before, ...patch };
      delete after['serverTs'];

      try {
        await Promise.all([
          this.history.write({ userId, changedBy: userId, action: 'update_profile', before, after, changedFields: diffKeys(before, after) }),
          this.vault.saveVersion(userId, after, userId),
        ]);
      } catch (historyErr) {
        this.logger.warn('History/vault write failed, but profile updated', historyErr);
      }

      return { ok: true };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
      this.logger.error(`updateProfile uid=${userId}`, err);
      throw new BadRequestException(`Profile update failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getAllUsers(role?: string) {
    try {
      const db = this.firebaseService.firestore;
      let q: FirebaseFirestore.Query = db.collection('users').orderBy('name', 'asc');
      if (role) q = q.where('role', '==', role);
      const snapshot = await q.get();
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (err) { return { ok: false, error: String(err) }; }
  }

  async updateUserRole(targetUserId: string, newRole: string, updatedBy: string) {
    const allowed = ['member', 'admin', 'superadmin', 'moderator'];
    if (!allowed.includes(newRole)) throw new BadRequestException(`Invalid role. Allowed: ${allowed.join(', ')}`);
    try {
      const db  = this.firebaseService.firestore;
      const ref = db.collection('users').doc(targetUserId);
      const snap = await ref.get();
      if (!snap.exists) throw new NotFoundException('User not found');
      const before = snap.data() as Record<string, unknown>;
      const oldRole = before.role;
      await ref.update({ role: newRole, updatedAt: new Date().toISOString(), serverTs: this.firebaseService.timestamp });
      await this.firebaseService.auth.setCustomUserClaims(targetUserId, { role: newRole });
      await Promise.all([
        db.collection('logs').add({ userId: updatedBy, targetUserId, action: 'update_role', oldRole, newRole, timestamp: this.firebaseService.timestamp }),
        this.history.write({ userId: targetUserId, changedBy: updatedBy, action: 'update_role', before, after: { ...before, role: newRole }, changedFields: ['role'] }),
      ]);
      return { ok: true, oldRole, newRole };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
      return { ok: false, error: String(err) };
    }
  }

  async updateUserStatus(targetUserId: string, status: string, updatedBy: string) {
    const allowed = ['active', 'suspended', 'inactive'];
    if (!allowed.includes(status)) throw new BadRequestException(`Status harus: ${allowed.join(', ')}`);
    try {
      const db  = this.firebaseService.firestore;
      await db.collection('users').doc(targetUserId).update({ status, updatedAt: new Date().toISOString(), serverTs: this.firebaseService.timestamp });
      await db.collection('logs').add({ userId: updatedBy, targetUserId, action: 'update_status', newStatus: status, timestamp: this.firebaseService.timestamp });
      return { ok: true };
    } catch (err) { return { ok: false, error: String(err) }; }
  }

  async getLeaderboard(limit = 50) {
    try {
      const db = this.firebaseService.firestore;
      const snap = await db.collection('users')
        .where('status', 'in', ['active', 'npc'])
        .orderBy('xpCache', 'desc')
        .limit(Math.min(limit, 100))
        .get();
      return snap.docs.map((doc, i) => ({
        rank: i + 1, uid: doc.id, id: doc.id,
        name: doc.data().name || doc.data().displayName || 'Unknown',
        displayName: doc.data().name || doc.data().displayName || 'Unknown',
        division: doc.data().division, xpCache: doc.data().xpCache || 0,
        attendanceCount: doc.data().attendanceCount || 0, streak: doc.data().streak || 0,
        role: doc.data().role, level: Math.floor((doc.data().xpCache || 0) / 100) + 1,
      }));
    } catch (err) { return { ok: false, error: String(err) }; }
  }

  async getDashboardStats(userId: string) {
    try {
      const db   = this.firebaseService.firestore;
      const snap = await db.collection('users').doc(userId).get();
      if (!snap.exists) throw new NotFoundException('User not found');
      const user = snap.data() || {};
      const xp   = user.xpCache || 0;
      const recentAttendance = await db.collection('attendance')
        .where('userId', '==', userId).orderBy('attendedAt', 'desc').limit(10).get();
      const recentPresent = recentAttendance.docs.filter(d => d.data().status === 'present').length;
      return {
        user: { displayName: user.name || user.displayName, email: user.email, division: user.division, role: user.role, memberId: user.memberId },
        stats: { xp, level: Math.floor(xp / 100) + 1, xpInLevel: xp % 100, xpToNextLevel: 100 - (xp % 100), attendanceCount: user.attendanceCount || 0, streak: user.streak || 0, badgesCount: user.badgesCount || 0, recentPresent },
        recentAttendance: recentAttendance.docs.map(d => ({ id: d.id, ...d.data() })),
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      return { ok: false, error: String(err) };
    }
  }
}
