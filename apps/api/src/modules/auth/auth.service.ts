/**
 * AuthService — NEWGAME
 * ─────────────────────────────────────────────────────────────────────────────
 * Service untuk alur registrasi & login yang melibatkan Member ID.
 * Better Auth menangani session/token/OAuth secara langsung via controller-nya.
 *
 * Tanggung jawab service ini:
 *  1. verifyMember   — validasi Member ID + kode akses SEBELUM register
 *  2. createUserProfile — update Member.isRegistered setelah Better Auth buat user
 *  3. lookupByMemberId  — cari email dari Member ID (untuk login via ID)
 *  4. getUserProfile    — ambil profil lengkap dari PostgreSQL
 *  5. setUserRole       — update role di PostgreSQL
 *  6. getAllUsers        — daftar semua user (admin only)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  Injectable, BadRequestException,
  NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcryptjs';

const ALLOWED_ROLES = [
  'member', 'admin', 'superadmin', 'moderator',
  'npc', 'glory', 'glory_lead', 'inventori',
  'quest keeper', 'gold guardian', 'code commander', 'pixel presiden',
];

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  // ── 1. Verifikasi Member ID + Kode Akses ──────────────────────────────────
  /**
   * Dipanggil SEBELUM Better Auth createUser.
   * Memastikan:
   *   - Member ID terdaftar di database (tabel members)
   *   - Kode akses (tempPassword) cocok dengan hash bcrypt
   *   - Member belum pernah registrasi
   */
  async verifyMember(memberId: string, tempPassword: string) {
    const normalizedId = memberId.trim().toUpperCase();

    const member = await this.prisma.member.findUnique({
      where: { memberId: normalizedId },
    });

    if (!member) {
      throw new NotFoundException('Member ID tidak ditemukan. Periksa kembali ID kamu.');
    }

    if (member.isRegistered) {
      throw new BadRequestException(
        'Member ID ini sudah digunakan untuk registrasi. ' +
        'Jika kamu lupa email/password, gunakan fitur "Lupa Password".',
      );
    }

    // Verifikasi kode akses (bcrypt hash)
    const isHashed = member.tempPassword?.startsWith('$2');
    const passwordMatch = isHashed
      ? await bcrypt.compare(tempPassword, member.tempPassword)
      : member.tempPassword === tempPassword;

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Kode akses salah. Periksa kembali kode yang dikirimkan ke kamu.',
      );
    }

    return {
      valid:      true,
      memberId:   member.memberId,
      name:       member.name,
      pillar:     member.pillar,
      generation: member.generation,
      team:       member.team,
      status:     member.status,
    };
  }

  // ── 2. Buat Profil User setelah Better Auth Register ─────────────────────
  /**
   * Dipanggil setelah Better Auth berhasil buat akun.
   * Menghubungkan User (Better Auth) dengan Member (PostgreSQL).
   */
  async linkMemberToUser(userId: string, memberId: string) {
    const normalizedId = memberId.trim().toUpperCase();

    const member = await this.prisma.member.findUnique({
      where: { memberId: normalizedId },
    });

    if (!member) {
      throw new NotFoundException('Member ID tidak ditemukan');
    }

    if (member.isRegistered && member.userId !== userId) {
      throw new BadRequestException('Member ID sudah digunakan oleh akun lain');
    }

    // Tandai member sebagai terdaftar + link ke userId
    await this.prisma.member.update({
      where: { memberId: normalizedId },
      data: {
        isRegistered: true,
        userId:       userId,
        registeredAt: new Date(),
      },
    });

    // Update User dengan data dari Member
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        memberId: normalizedId,
        pillar:   member.pillar as string,
        division: member.pillar as string, // sync ke division lama
        role:     'member',
        status:   'active',
        isActive: true,
      },
    });

    return { success: true, memberId: normalizedId };
  }

  // ── 3. Lookup email dari Member ID (untuk login via ID) ───────────────────
  /**
   * Dipakai di login unified: user ketik Member ID → ambil email → Better Auth sign-in.
   */
  async lookupByMemberId(memberId: string) {
    if (!memberId?.toUpperCase().startsWith('NG')) {
      throw new BadRequestException(
        'Format Member ID tidak valid. Contoh: NG11020038PG',
      );
    }

    const normalizedId = memberId.trim().toUpperCase();

    const member = await this.prisma.member.findUnique({
      where: { memberId: normalizedId },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException('Member ID tidak ditemukan');
    }

    if (!member.isRegistered || !member.user) {
      throw new BadRequestException(
        'Akun belum terdaftar. Silakan daftar menggunakan Member ID dan Kode Akses.',
      );
    }

    const user = member.user;

    if ((user as any).status === 'suspended') {
      throw new UnauthorizedException('Akun kamu telah dinonaktifkan. Hubungi admin.');
    }

    // Mask email untuk keamanan: "radi@email.com" → "r**i@email.com"
    const email = user.email;
    const [local, domain] = email.split('@');
    const maskedLocal =
      local.length <= 2
        ? local[0] + '*'
        : local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];

    return {
      found:       true,
      email,                          // email asli untuk Better Auth signIn
      maskedEmail: `${maskedLocal}@${domain}`,
      displayName: (user as any).displayName || user.name || '',
      role:        (user as any).role || 'member',
    };
  }

  // ── 4. Ambil profil lengkap ───────────────────────────────────────────────
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true, profile: true },
    });

    if (!user) throw new NotFoundException('User tidak ditemukan');

    return {
      id:             user.id,
      email:          user.email,
      name:           user.name,
      displayName:    (user as any).displayName || user.name,
      role:           (user as any).role || 'member',
      memberId:       (user as any).memberId,
      pillar:         (user as any).pillar,
      division:       (user as any).division,
      xpCache:        (user as any).xpCache  || 0,
      level:          (user as any).level    || 1,
      streak:         (user as any).streak   || 0,
      attendanceCount:(user as any).attendanceCount || 0,
      status:         (user as any).status   || 'active',
      image:          user.image,
      member:         user.member,
    };
  }

  // ── 5. Set Role ───────────────────────────────────────────────────────────
  async setUserRole(targetUserId: string, role: string, callerRole?: string) {
    if (!ALLOWED_ROLES.includes(role)) {
      throw new BadRequestException(`Role '${role}' tidak valid`);
    }

    // Admin biasa hanya bisa reset ke 'member'
    if (callerRole === 'admin' && role !== 'member') {
      throw new UnauthorizedException('Admin hanya bisa mengubah role ke member');
    }

    await this.prisma.user.update({
      where: { id: targetUserId },
      data:  { role },
    });

    return { success: true, role };
  }

  // ── 6. Daftar semua user (superadmin only) ────────────────────────────────
  async getAllUsers(limit = 100) {
    const users = await this.prisma.user.findMany({
      take:    limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:          true,
        name:        true,
        email:       true,
        image:       true,
        createdAt:   true,
        role:        true,
        memberId:    true,
        pillar:      true,
        division:    true,
        status:      true,
        isActive:    true,
      } as any,
    });

    return users.map((u: any) => ({
      id:          u.id,
      displayName: u.name,
      email:       u.email,
      memberId:    u.memberId || '',
      role:        u.role     || 'member',
      pillar:      u.pillar   || '',
      division:    u.division || '',
      status:      u.status   || 'active',
    }));
  }
}
