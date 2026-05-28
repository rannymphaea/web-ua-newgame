import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { UserHistoryService } from '../user-history/user-history.service';
import { UserVaultService } from '../user-vault/user-vault.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { diffKeys } from '../../common/utils/hash.util';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly firebase: FirebaseService,
    private readonly history:  UserHistoryService,
    private readonly vault:    UserVaultService,
  ) {}

  async list(opts: { page: number; limit: number; search?: string; division?: string; role?: string; status?: string }) {
    try {
      const db = this.firebase.firestore;
      let q: FirebaseFirestore.Query = db.collection('users');
      if (opts.division) q = q.where('division', '==', opts.division);
      if (opts.role)     q = q.where('role',     '==', opts.role);
      if (opts.status)   q = q.where('status',   '==', opts.status);
      q = q.orderBy('name', 'asc').limit(opts.limit + 1).offset((opts.page - 1) * opts.limit);

      const snap = await q.get();
      let docs   = snap.docs.slice(0, opts.limit).map(d => ({ uid: d.id, ...d.data() }));
      if (opts.search) {
        const s = opts.search.toLowerCase();
        docs = docs.filter(d => JSON.stringify(d).toLowerCase().includes(s));
      }
      return { data: docs, page: opts.page, limit: opts.limit, hasMore: snap.docs.length > opts.limit };
    } catch (err) {
      this.logger.error('Members list failed', err);
      return { ok: false, error: String(err), data: [], page: opts.page, limit: opts.limit, hasMore: false };
    }
  }

  async getOne(uid: string) {
    try {
      const snap = await this.firebase.firestore.collection('users').doc(uid).get();
      if (!snap.exists) throw new NotFoundException(`Member ${uid} not found`);
      const [recentHistory, latestVault] = await Promise.all([
        this.history.getByUser(uid, 5),
        this.vault.getLatest(uid),
      ]);
      return { ok: true, uid: snap.id, ...snap.data(), recentHistory, latestVault };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      return { ok: false, error: String(err) };
    }
  }

  async create(dto: CreateMemberDto, createdBy: string) {
    try {
      const db  = this.firebase.firestore;
      const dup = await db.collection('users').where('email', '==', dto.email).get();
      if (!dup.empty) throw new ConflictException(`Email ${dto.email} already exists`);
      const now  = new Date().toISOString();
      const data = {
        name: dto.name, email: dto.email,
        username: dto.username || '', division: dto.division || '',
        role: dto.role || 'member', memberId: dto.memberId || '',
        status: dto.status || 'active', notes: dto.notes || '',
        xpCache: 0, streak: 0, attendanceCount: 0,
        createdAt: now, updatedAt: now, createdBy,
      };
      const ref = await db.collection('users').add({ ...data, serverTs: this.firebase.timestamp });
      await Promise.all([
        this.history.write({ userId: ref.id, changedBy: createdBy, action: 'create_member', before: {}, after: data, changedFields: Object.keys(data) }),
        this.vault.saveVersion(ref.id, data, createdBy),
      ]);
      return { ok: true, uid: ref.id };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      this.logger.error('Members create failed', err);
      return { ok: false, error: String(err) };
    }
  }

  async update(uid: string, dto: UpdateMemberDto, updatedBy: string) {
    try {
      const ref  = this.firebase.firestore.collection('users').doc(uid);
      const snap = await ref.get();
      if (!snap.exists) throw new NotFoundException(`Member ${uid} not found`);
      const before = snap.data() as Record<string, unknown>;
      const patch: Record<string, unknown> = {};
      const dtoKeys = Object.keys(dto) as Array<keyof CreateMemberDto>;
      for (const k of dtoKeys) {
        if (dto[k] !== undefined) patch[k] = dto[k];
      }
      if (!Object.keys(patch).length) return { ok: true, message: 'No changes' };
      patch.updatedAt = new Date().toISOString();
      patch.updatedBy = updatedBy;
      await ref.set({ ...patch, serverTs: this.firebase.timestamp }, { merge: true });
      const after = { ...before, ...patch };
      delete after['serverTs'];
      await Promise.all([
        this.history.write({ userId: uid, changedBy: updatedBy, action: 'update_member', before, after, changedFields: diffKeys(before, after) }),
        this.vault.saveVersion(uid, after, updatedBy),
      ]);
      return { ok: true };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      return { ok: false, error: String(err) };
    }
  }

  async remove(uid: string, deletedBy: string) {
    try {
      const ref  = this.firebase.firestore.collection('users').doc(uid);
      const snap = await ref.get();
      if (!snap.exists) throw new NotFoundException(`Member ${uid} not found`);
      const before = snap.data() as Record<string, unknown>;
      await ref.update({ status: 'inactive', deletedAt: new Date().toISOString(), deletedBy, serverTs: this.firebase.timestamp });
      await this.history.write({ userId: uid, changedBy: deletedBy, action: 'soft_delete', before, after: { ...before, status: 'inactive' }, changedFields: ['status'] });
      return { ok: true };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      return { ok: false, error: String(err) };
    }
  }

  async import(format: 'csv' | 'json', data: string, importedBy: string) {
    try {
      const db = this.firebase.firestore;
      const members: CreateMemberDto[] = [];

      if (format === 'json') {
        const parsed = JSON.parse(data);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of arr) {
          if (item.name && item.email) {
            members.push({
              name: item.name,
              email: item.email,
              username: item.username,
              division: item.division,
              role: item.role,
              memberId: item.memberId,
              status: item.status,
              notes: item.notes,
            });
          }
        }
      } else if (format === 'csv') {
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => obj[h] = values[idx] || '');
          if (obj.name && obj.email) {
            members.push({
              name: obj.name,
              email: obj.email,
              username: obj.username,
              division: obj.division,
              role: obj.role,
              memberId: obj.memberid,
              status: obj.status,
              notes: obj.notes,
            });
          }
        }
      }

      const results = { created: 0, failed: 0, errors: [] as string[] };
      const now = new Date().toISOString();

      for (const dto of members) {
        try {
          const dup = await db.collection('users').where('email', '==', dto.email).get();
          if (!dup.empty) {
            results.failed++;
            results.errors.push(`Email ${dto.email} already exists`);
            continue;
          }
          const memberData = {
            name: dto.name, email: dto.email,
            username: dto.username || '', division: dto.division || '',
            role: dto.role || 'member', memberId: dto.memberId || '',
            status: dto.status || 'active', notes: dto.notes || '',
            xpCache: 0, streak: 0, attendanceCount: 0,
            createdAt: now, updatedAt: now, createdBy: importedBy,
          };
          const ref = await db.collection('users').add({ ...memberData, serverTs: this.firebase.timestamp });
          await Promise.all([
            this.history.write({ userId: ref.id, changedBy: importedBy, action: 'import_member', before: {}, after: memberData, changedFields: Object.keys(memberData) }),
            this.vault.saveVersion(ref.id, memberData, importedBy),
          ]);
          results.created++;
        } catch (e) {
          results.failed++;
          results.errors.push(`${dto.email}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      return { ok: true, ...results };
    } catch (err) {
      this.logger.error('Import failed', err);
      throw new BadRequestException(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
