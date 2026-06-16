import {
  Injectable, Logger, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserHistoryService } from '../user-history/user-history.service';
import { UserVaultService } from '../user-vault/user-vault.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberPillar, MemberGeneration, MemberStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

/** Generate kode akses default — sama dengan script seed */
function generateTempPassword(memberId: string, memberNo: number): string {
  const suffix   = memberId.slice(-5).toLowerCase();
  const noPadded = String(memberNo).padStart(3, '0');
  return `ng${noPadded}${suffix}`;
}

const PILLAR_MAP: Record<string, MemberPillar> = {
  'Game Logic':  MemberPillar.GAME_LOGIC,
  'Game Design': MemberPillar.GAME_DESIGN,
  'Game Sound':  MemberPillar.GAME_SOUND,
  'GAME_LOGIC':  MemberPillar.GAME_LOGIC,
  'GAME_DESIGN': MemberPillar.GAME_DESIGN,
  'GAME_SOUND':  MemberPillar.GAME_SOUND,
};
const GEN_MAP: Record<string, MemberGeneration> = {
  'GEN 1': MemberGeneration.GEN_1, 'GEN 2': MemberGeneration.GEN_2,
  'GEN_1': MemberGeneration.GEN_1, 'GEN_2': MemberGeneration.GEN_2,
};
const STATUS_MAP: Record<string, MemberStatus> = {
  ACTIVE: MemberStatus.ACTIVE, AFK: MemberStatus.AFK,
  RESIGN: MemberStatus.RESIGN, GLORY: MemberStatus.GLORY, NPC: MemberStatus.NPC,
};

// Fields yang boleh dikembalikan ke client (tanpa tempPassword)
const SAFE_SELECT = {
  id: true, memberId: true, memberNo: true, name: true,
  pillar: true, generation: true, team: true, status: true,
  isRegistered: true, registeredAt: true, xpCache: true, level: true,
  userId: true, createdAt: true, updatedAt: true,
} as const;

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly prisma:   PrismaService,
    private readonly history:  UserHistoryService,
    private readonly vault:    UserVaultService,
  ) {}

  // ── LIST ────────────────────────────────────────────────────────────────────
  async list(opts: {
    page: number; limit: number; search?: string;
    division?: string; status?: string; generation?: string;
  }) {
    const { page, limit, search, division, status, generation } = opts;
    const where: any = {};

    if (division)   where.pillar     = PILLAR_MAP[division]  ?? division;
    if (status)     where.status     = STATUS_MAP[(status || '').toUpperCase()] ?? status;
    if (generation) where.generation = GEN_MAP[generation]   ?? generation;
    if (search) {
      where.OR = [
        { name:     { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } },
        { team:     { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.member.findMany({
        where, skip: (page - 1) * limit, take: limit + 1,
        orderBy: { memberNo: 'asc' },
        select: SAFE_SELECT,
      }),
      this.prisma.member.count({ where }),
    ]);

    const hasMore = data.length > limit;
    return { data: data.slice(0, limit), page, limit, total, hasMore };
  }

  // ── GET ONE ─────────────────────────────────────────────────────────────────
  async getOne(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { memberId },
      select: SAFE_SELECT,
    });
    if (!member) throw new NotFoundException(`Member ${memberId} tidak ditemukan`);
    return { ok: true, ...member };
  }

  // ── CREATE — Admin tambah anggota baru ───────────────────────────────────────
  async create(dto: CreateMemberDto, createdBy: string) {
    const existing = await this.prisma.member.findUnique({ where: { memberId: dto.memberId! } });
    if (existing) throw new ConflictException(`Member ID ${dto.memberId} sudah ada`);

    const plain  = (dto as any).tempPassword || generateTempPassword(dto.memberId!, dto.memberNo!);
    const hashed = await bcrypt.hash(plain, 10);

    const member = await this.prisma.member.create({
      data: {
        memberId:     dto.memberId!,
        memberNo:     dto.memberNo!,
        name:         dto.name,
        pillar:       PILLAR_MAP[dto.pillar!]    ?? MemberPillar.GAME_LOGIC,
        generation:   GEN_MAP[dto.generation!]   ?? MemberGeneration.GEN_1,
        team:         dto.team || '',
        status:       STATUS_MAP[(dto.status || 'ACTIVE').toUpperCase()] ?? MemberStatus.ACTIVE,
        tempPassword: hashed,
        isRegistered: false,
      },
    });

    await this.history.write({
      userId: createdBy, changedBy: createdBy, action: 'create_member',
      before: {}, after: { memberId: member.memberId, name: member.name },
      changedFields: ['memberId', 'name', 'pillar', 'generation', 'team', 'status'],
    }).catch(() => {});

    return { ok: true, id: member.id, memberId: member.memberId, tempPasswordPlain: plain };
  }

  // ── UPDATE ───────────────────────────────────────────────────────────────────
  async update(memberId: string, dto: UpdateMemberDto, updatedBy: string) {
    const existing = await this.prisma.member.findUnique({ where: { memberId } });
    if (!existing) throw new NotFoundException(`Member ${memberId} tidak ditemukan`);

    const patch: any = {};
    if (dto.name)   patch.name   = dto.name;
    if (dto.team)   patch.team   = dto.team;
    if (dto.status) patch.status = STATUS_MAP[(dto.status).toUpperCase()] ?? existing.status;

    if (!Object.keys(patch).length) return { ok: true, message: 'Tidak ada perubahan' };

    await this.prisma.member.update({ where: { memberId }, data: patch });
    await this.history.write({
      userId: updatedBy, changedBy: updatedBy, action: 'update_member',
      before: existing as any, after: { ...existing, ...patch },
      changedFields: Object.keys(patch),
    }).catch(() => {});

    return { ok: true };
  }

  // ── RESET PASSWORD — Admin generate ulang kode akses ─────────────────────────
  async resetPassword(memberId: string, adminUid: string) {
    const member = await this.prisma.member.findUnique({ where: { memberId } });
    if (!member) throw new NotFoundException(`Member ${memberId} tidak ditemukan`);
    if (member.isRegistered) {
      throw new BadRequestException(
        'Anggota sudah registrasi. Untuk reset password akun, gunakan Firebase Console.',
      );
    }

    const plain  = generateTempPassword(member.memberId, member.memberNo);
    const hashed = await bcrypt.hash(plain, 10);
    await this.prisma.member.update({ where: { memberId }, data: { tempPassword: hashed } });

    await this.history.write({
      userId: adminUid, changedBy: adminUid, action: 'reset_temp_password',
      before: {}, after: { memberId }, changedFields: ['tempPassword'],
    }).catch(() => {});

    return { ok: true, memberId, tempPasswordPlain: plain };
  }

  // ── REMOVE (ubah status jadi RESIGN) ────────────────────────────────────────
  async remove(memberId: string, deletedBy: string) {
    const member = await this.prisma.member.findUnique({ where: { memberId } });
    if (!member) throw new NotFoundException(`Member ${memberId} tidak ditemukan`);

    await this.prisma.member.update({
      where: { memberId },
      data:  { status: MemberStatus.RESIGN },
    });
    await this.history.write({
      userId: deletedBy, changedBy: deletedBy, action: 'soft_delete_member',
      before: member as any, after: { ...member, status: MemberStatus.RESIGN },
      changedFields: ['status'],
    }).catch(() => {});

    return { ok: true };
  }

  // ── EXPORT CSV ───────────────────────────────────────────────────────────────
  async exportCsv(opts: { division?: string; status?: string; generation?: string }) {
    const where: any = {};
    if (opts.division)   where.pillar     = PILLAR_MAP[opts.division]   ?? opts.division;
    if (opts.status)     where.status     = STATUS_MAP[(opts.status || '').toUpperCase()] ?? opts.status;
    if (opts.generation) where.generation = GEN_MAP[opts.generation]    ?? opts.generation;

    const members = await this.prisma.member.findMany({
      where, orderBy: { memberNo: 'asc' }, select: SAFE_SELECT,
    });

    const headers = ['Member ID', 'No', 'Nama', 'Pillar', 'Generasi', 'Tim', 'Status', 'Registrasi', 'XP', 'Level'];
    const rows = members.map(m => [
      m.memberId, m.memberNo, m.name, m.pillar, m.generation,
      m.team, m.status, m.isRegistered ? 'Ya' : 'Belum', m.xpCache, m.level,
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));

    return { csv: [headers.join(','), ...rows].join('\n'), count: members.length };
  }

  // ── IMPORT ───────────────────────────────────────────────────────────────────
  async import(format: 'csv' | 'json', data: string, importedBy: string) {
    const dtos: CreateMemberDto[] = [];

    try {
      if (format === 'json') {
        const arr = Array.isArray(JSON.parse(data)) ? JSON.parse(data) : [JSON.parse(data)];
        for (const item of arr) {
          if (item.memberId && item.name) dtos.push(item as CreateMemberDto);
        }
      } else {
        const lines   = data.trim().split('\n');
        const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''));
          const obj: Record<string, string> = {};
          headers.forEach((h: string, idx: number) => (obj[h] = values[idx] || ''));
          if (obj.memberid && obj.name) dtos.push({
            memberId: obj.memberid, memberNo: +(obj.no || 0), name: obj.name,
            pillar: obj.pillar, generation: obj.generasi || obj.generation,
            team: obj.tim || obj.team, status: obj.status,
          } as unknown as CreateMemberDto);
        }
      }
    } catch {
      throw new BadRequestException('Format data tidak valid');
    }

    const results = { created: 0, failed: 0, errors: [] as string[] };
    for (const dto of dtos) {
      try {
        await this.create(dto, importedBy);
        results.created++;
      } catch (e) {
        results.failed++;
        results.errors.push(`${dto.memberId}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return { ok: true, ...results };
  }
}
