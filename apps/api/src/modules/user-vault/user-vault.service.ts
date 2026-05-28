import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { hashChain } from '../../common/utils/hash.util';

export interface VaultVersion {
  versionId:  string;
  userId:     string;
  versionNum: number;
  snapshot:   Record<string, unknown>;
  prevHash:   string;
  hashChain:  string;
  createdAt:  string;
  changedBy:  string;
}

@Injectable()
export class UserVaultService {
  private readonly logger = new Logger(UserVaultService.name);
  constructor(private readonly firebase: FirebaseService) {}

  async saveVersion(userId: string, snapshot: Record<string, unknown>, changedBy: string): Promise<string> {
    try {
      const col = this.firebase.firestore.collection('user_vault').doc(userId).collection('versions');
      const lastSnap = await col.orderBy('versionNum', 'desc').limit(1).get();
      const lastDoc  = lastSnap.docs[0];
      const prevHash  = lastDoc?.data()?.hashChain ?? '0000000000000000';
      const versionNum = (lastDoc?.data()?.versionNum ?? 0) + 1;
      const chain = hashChain(prevHash, snapshot);
      const ref = await col.add({ userId, versionNum, snapshot, prevHash, hashChain: chain, createdAt: new Date().toISOString(), changedBy, serverTs: this.firebase.timestamp });
      return ref.id;
    } catch (err) { this.logger.error('UserVault saveVersion failed', err); return ''; }
  }

  async getVersions(userId: string, limit = 20): Promise<VaultVersion[]> {
    try {
      const snap = await this.firebase.firestore.collection('user_vault').doc(userId).collection('versions')
        .orderBy('versionNum', 'desc').limit(Math.min(limit, 50)).get();
      return snap.docs.map(d => ({ versionId: d.id, ...d.data() } as VaultVersion));
    } catch { return []; }
  }

  async getLatest(userId: string): Promise<VaultVersion | null> {
    try {
      const snap = await this.firebase.firestore.collection('user_vault').doc(userId).collection('versions')
        .orderBy('versionNum', 'desc').limit(1).get();
      if (snap.empty) return null;
      return { versionId: snap.docs[0].id, ...snap.docs[0].data() } as VaultVersion;
    } catch { return null; }
  }

  async getDiff(userId: string, vA: number, vB: number) {
    try {
      const snap = await this.firebase.firestore.collection('user_vault').doc(userId).collection('versions')
        .where('versionNum', 'in', [vA, vB]).get();
      const docs = snap.docs.map(d => ({ num: d.data().versionNum as number, snap: d.data().snapshot as Record<string,unknown> }));
      const a = docs.find(d => d.num === vA)?.snap ?? {};
      const b = docs.find(d => d.num === vB)?.snap ?? {};
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
      const diff: Record<string, { from: unknown; to: unknown }> = {};
      for (const k of allKeys) {
        if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) diff[k] = { from: a[k], to: b[k] };
      }
      return { versionA: vA, versionB: vB, diff };
    } catch { return { versionA: vA, versionB: vB, diff: {} }; }
  }
}
