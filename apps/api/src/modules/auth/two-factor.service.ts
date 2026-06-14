import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import * as crypto from 'crypto';

/**
 * TwoFactorService — TOTP-based 2FA for admin accounts.
 * 
 * Flow:
 * 1. Admin calls POST /auth/2fa/setup → gets secret + otpauth URI (for QR code)
 * 2. Admin scans QR in Google Authenticator / Authy
 * 3. Admin calls POST /auth/2fa/verify with the 6-digit code → 2FA enabled
 * 4. On login, if 2FA enabled, frontend must call POST /auth/2fa/validate before granting access
 *
 * Uses HMAC-based TOTP (RFC 6238) — no external library needed.
 */
@Injectable()
export class TwoFactorService {
  constructor(private firebase: FirebaseService) {}

  /** Generate a new TOTP secret for a user */
  async setup(userId: string) {
    const db = this.firebase.firestore;
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) throw new BadRequestException('User tidak ditemukan');

    const userData = userSnap.data();
    if (userData.twoFactorEnabled) {
      throw new BadRequestException('2FA sudah aktif. Nonaktifkan dulu sebelum setup ulang.');
    }

    // Generate 20-byte random secret
    const secretBuffer = crypto.randomBytes(20);
    const secret = this.base32Encode(secretBuffer);

    // Save pending secret (not yet verified)
    await db.collection('users').doc(userId).update({
      twoFactorPending: secret,
    });

    // Build otpauth URI for QR code scanning
    const email = userData.email || 'user@newgame';
    const issuer = 'NEWGAME';
    const otpauthUri = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}&digits=6&period=30`;

    return {
      secret,
      otpauthUri,
      message: 'Scan QR code di Google Authenticator, lalu verifikasi dengan kode 6 digit.',
    };
  }

  /** Verify TOTP code and enable 2FA */
  async verify(userId: string, code: string) {
    const db = this.firebase.firestore;
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) throw new BadRequestException('User tidak ditemukan');

    const userData = userSnap.data();
    const secret = userData.twoFactorPending;
    if (!secret) {
      throw new BadRequestException('Belum setup 2FA. Panggil /auth/2fa/setup dulu.');
    }

    if (!this.verifyTOTP(secret, code.trim())) {
      throw new UnauthorizedException('Kode 2FA tidak valid. Pastikan waktu device sinkron.');
    }

    // Enable 2FA
    await db.collection('users').doc(userId).update({
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorPending: null,
      twoFactorEnabledAt: this.firebase.timestamp,
    });

    // Log
    await db.collection('logs').add({
      userId,
      action: '2fa_enabled',
      result: 'success',
      timestamp: this.firebase.timestamp,
    });

    return { success: true, message: '2FA berhasil diaktifkan!' };
  }

  /** Validate TOTP code on login */
  async validate(userId: string, code: string) {
    const db = this.firebase.firestore;
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) throw new BadRequestException('User tidak ditemukan');

    const userData = userSnap.data();
    if (!userData.twoFactorEnabled || !userData.twoFactorSecret) {
      return { valid: true, message: '2FA tidak aktif — skip validasi' };
    }

    if (!this.verifyTOTP(userData.twoFactorSecret, code.trim())) {
      throw new UnauthorizedException('Kode 2FA tidak valid');
    }

    return { valid: true, message: '2FA terverifikasi' };
  }

  /** Disable 2FA */
  async disable(userId: string, code: string) {
    const db = this.firebase.firestore;
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) throw new BadRequestException('User tidak ditemukan');

    const userData = userSnap.data();
    if (!userData.twoFactorEnabled) {
      throw new BadRequestException('2FA belum aktif');
    }

    // Verify code before disabling
    if (!this.verifyTOTP(userData.twoFactorSecret, code.trim())) {
      throw new UnauthorizedException('Kode 2FA tidak valid — tidak bisa menonaktifkan');
    }

    await db.collection('users').doc(userId).update({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorPending: null,
    });

    await db.collection('logs').add({
      userId,
      action: '2fa_disabled',
      result: 'success',
      timestamp: this.firebase.timestamp,
    });

    return { success: true, message: '2FA berhasil dinonaktifkan' };
  }

  /** Check if user has 2FA enabled */
  async status(userId: string) {
    const userSnap = await this.firebase.firestore.collection('users').doc(userId).get();
    if (!userSnap.exists) return { enabled: false };
    return { enabled: !!userSnap.data().twoFactorEnabled };
  }

  // ── TOTP Implementation (RFC 6238) ────────────────────────

  private verifyTOTP(secret: string, code: string): boolean {
    // Check current time step and ±1 window for clock drift
    const timeStep = 30;
    const now = Math.floor(Date.now() / 1000);
    for (let offset = -1; offset <= 1; offset++) {
      const counter = Math.floor((now + offset * timeStep) / timeStep);
      const expected = this.generateTOTP(secret, counter);
      if (expected === code) return true;
    }
    return false;
  }

  private generateTOTP(secret: string, counter: number): string {
    const secretBuffer = this.base32Decode(secret);
    const counterBuffer = Buffer.alloc(8);
    // Write counter as big-endian 64-bit
    for (let i = 7; i >= 0; i--) {
      counterBuffer[i] = counter & 0xff;
      counter = Math.floor(counter / 256);
    }

    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(counterBuffer);
    const hash = hmac.digest();

    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }
    return output;
  }

  private base32Decode(input: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const output: number[] = [];
    for (const char of input.toUpperCase()) {
      const idx = alphabet.indexOf(char);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return Buffer.from(output);
  }
}
