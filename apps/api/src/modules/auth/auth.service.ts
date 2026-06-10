import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import * as bcrypt from 'bcryptjs';

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

    // Support both bcrypt hash (v2 seed) and plain legacy comparison
    const isHashed = member.tempPassword?.startsWith('$2');
    const passwordMatch = isHashed
      ? await bcrypt.compare(tempPassword, member.tempPassword)
      : member.tempPassword === tempPassword;

    if (!passwordMatch) {
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
   * Lookup email dari NEWGAME Member ID (e.g. "NG11020125SF").
   * Digunakan untuk login via Member ID — client akan pakai email
   * yang dikembalikan untuk Firebase signInWithEmailAndPassword().
   */
  async lookupByNewgameId(newgameId: string) {
    if (!newgameId || !newgameId.startsWith('NG')) {
      throw new BadRequestException('Format Member ID tidak valid. Contoh: NG11020125SF');
    }

    const normalizedId = newgameId.trim().toUpperCase();
    const db = this.firebaseService.firestore;

    // Cari di collection members berdasarkan memberId
    const membersSnap = await db
      .collection('members')
      .where('memberId', '==', normalizedId)
      .limit(1)
      .get();

    if (membersSnap.empty) {
      throw new NotFoundException('ID anggota tidak ditemukan');
    }

    const member = membersSnap.docs[0].data();

    // Cek apakah member sudah registrasi
    if (!member.isRegistered || !member.registeredUserId) {
      throw new BadRequestException(
        'Akun belum terdaftar. Silakan daftar terlebih dahulu menggunakan Member ID dan Kode Akses.',
      );
    }

    // Ambil user dari Firestore untuk mendapatkan email
    const userSnap = await db
      .collection('users')
      .doc(member.registeredUserId)
      .get();

    if (!userSnap.exists) {
      throw new NotFoundException('ID anggota tidak ditemukan');
    }

    const user = userSnap.data();

    // Cek status akun
    if (user.status === 'suspended') {
      throw new UnauthorizedException('Akun kamu telah dinonaktifkan. Hubungi admin.');
    }

    if (user.status === 'inactive') {
      throw new UnauthorizedException('Akun kamu belum diaktifkan oleh admin');
    }

    // Mask email untuk keamanan: "raditya@email.com" → "r*****a@email.com"
    const email = user.email;
    const [localPart, domain] = email.split('@');
    const maskedLocal =
      localPart.length <= 2
        ? localPart[0] + '*'
        : localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
    const maskedEmail = `${maskedLocal}@${domain}`;

    return {
      found: true,
      email,           // Email asli — dikirim ke client untuk signIn
      maskedEmail,     // Email yang di-mask — ditampilkan ke user
      displayName: user.displayName || user.name || '',
      role: user.role || 'member',
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
   * pixel presiden → bisa set role apapun
   * admin          → hanya bisa set role 'member'
   */
  async setUserRole(uid: string, role: string, callerRole?: string) {
    const allowedRoles = ['member', 'admin', 'inventori', 'quest keeper', 'gold guardian', 'code commander', 'pixel presiden'];
    if (!allowedRoles.includes(role)) {
      throw new BadRequestException(`Role '${role}' tidak valid`);
    }

    // Admin biasa hanya boleh mengembalikan ke 'member'
    if (callerRole === 'admin' && role !== 'member') {
      throw new UnauthorizedException('Admin hanya bisa mengubah role ke member');
    }

    await this.firebaseService.auth.setCustomUserClaims(uid, { role });
    await this.firebaseService.firestore.collection('users').doc(uid).update({ role });
    return { success: true, role };
  }

  /**
   * Ambil semua user — untuk halaman manajemen role (pixel presiden only)
   */
  async getAllUsers(limit = 100) {
    const snapshot = await this.firebaseService.firestore
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id:          doc.id,
      displayName: doc.data().displayName || '',
      email:       doc.data().email || '',
      memberId:    doc.data().memberId || '',
      role:        doc.data().role || 'member',
      division:    doc.data().division || '',
      status:      doc.data().status || 'active',
    }));
  }

  /**
   * Daftarkan Admin baru (hanya bisa dipanggil oleh pixel presiden).
   * Flow: buat Firebase Auth user → set custom claim role=admin → tulis Firestore doc → log.
   */
  async registerAdmin(data: {
    email: string;
    password: string;
    displayName: string;
    division?: string;
  }) {
    // Validasi panjang password minimal 8 karakter
    if (!data.password || data.password.length < 8) {
      throw new BadRequestException('Password minimal 8 karakter');
    }
    if (!data.email || !data.email.includes('@')) {
      throw new BadRequestException('Email tidak valid');
    }
    if (!data.displayName || data.displayName.trim().length < 2) {
      throw new BadRequestException('displayName minimal 2 karakter');
    }

    let uid: string;
    try {
      // Firebase Auth — password di-hash oleh Firebase (bcrypt/scrypt internal)
      const userRecord = await this.firebaseService.auth.createUser({
        email:       data.email.trim().toLowerCase(),
        password:    data.password,           // Firebase hash otomatis
        displayName: data.displayName.trim(),
        emailVerified: false,
      });
      uid = userRecord.uid;
    } catch (e: any) {
      if (e.code === 'auth/email-already-exists') {
        throw new BadRequestException('Email sudah terdaftar');
      }
      throw new BadRequestException(`Firebase error: ${e.message}`);
    }

    const db  = this.firebaseService.firestore;
    const now = this.firebaseService.timestamp;

    // Set custom claim role=admin (dipakai RolesGuard)
    await this.firebaseService.auth.setCustomUserClaims(uid, { role: 'admin' });

    // Tulis dokumen user ke Firestore (batch: user doc + log)
    const batch  = db.batch();
    const userRef = db.collection('users').doc(uid);
    batch.set(userRef, {
      email:          data.email.trim().toLowerCase(),
      displayName:    data.displayName.trim(),
      division:       data.division || 'general',
      role:           'admin',
      status:         'active',
      memberId:       null,
      xpCache:        0,
      attendanceCount:0,
      streak:         0,
      createdAt:      now,
    });

    const logRef = db.collection('logs').doc();
    batch.set(logRef, {
      userId:    uid,
      action:    'register-admin',
      result:    'success',
      email:     data.email,
      timestamp: now,
    });

    await batch.commit();

    return {
      success: true,
      uid,
      email:       data.email.trim().toLowerCase(),
      displayName: data.displayName.trim(),
      role:        'admin',
    };
  }
}
