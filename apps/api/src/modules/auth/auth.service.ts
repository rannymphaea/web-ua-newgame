import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Verifikasi member ID dan password sementara.
   * Dipanggil sebelum registrasi akun Firebase.
   */
  async verifyMember(memberId: string, tempPassword: string) {
    const memberRef = this.firebaseService.firestore.collection('members').doc(memberId);
    const memberSnap = await memberRef.get();

    if (!memberSnap.exists) {
      throw new NotFoundException('Member ID tidak ditemukan');
    }

    const member = memberSnap.data();

    if (member.isRegistered) {
      throw new BadRequestException('Member ID sudah terdaftar');
    }

    if (member.tempPassword !== tempPassword) {
      throw new UnauthorizedException('Password sementara salah');
    }

    return {
      valid: true,
      memberId: member.memberId,
      name: member.name,
      division: member.division,
      team: member.team || '',
      status: member.status,
    };
  }

  /**
   * Setelah user berhasil register di Firebase Auth (client-side),
   * buat dokumen user di Firestore.
   */
  async createUserProfile(uid: string, data: {
    memberId: string;
    email: string;
    displayName: string;
    division: string;
    team?: string;
  }) {
    const db = this.firebaseService.firestore;
    const batch = db.batch();

    // Buat dokumen user
    const userRef = db.collection('users').doc(uid);
    batch.set(userRef, {
      email: data.email,
      displayName: data.displayName,
      memberId: data.memberId,
      division: data.division,
      team: data.team || '',
      role: 'member',
      status: 'active',
      xpCache: 0,
      attendanceCount: 0,
      streak: 0,
      createdAt: this.firebaseService.timestamp,
    });

    // Update status member jadi terdaftar
    const memberRef = db.collection('members').doc(data.memberId);
    batch.update(memberRef, {
      isRegistered: true,
      registeredUserId: uid,
      registeredAt: this.firebaseService.timestamp,
    });

    // Log
    const logRef = db.collection('logs').doc();
    batch.set(logRef, {
      userId: uid,
      action: 'register',
      result: 'success',
      memberId: data.memberId,
      timestamp: this.firebaseService.timestamp,
    });

    await batch.commit();

    return { success: true };
  }

  /**
   * Ambil profil user dari Firestore
   */
  async getUserProfile(uid: string) {
    const userSnap = await this.firebaseService.firestore
      .collection('users')
      .doc(uid)
      .get();

    if (!userSnap.exists) {
      throw new NotFoundException('User not found');
    }

    return { id: uid, ...userSnap.data() };
  }

  /**
   * Set custom claims (role) di Firebase Auth.
   * Dipanggil oleh admin saat mengubah role user.
   */
  async setUserRole(uid: string, role: string) {
    await this.firebaseService.auth.setCustomUserClaims(uid, { role });

    await this.firebaseService.firestore.collection('users').doc(uid).update({
      role: role,
    });

    return { success: true, role };
  }
}
