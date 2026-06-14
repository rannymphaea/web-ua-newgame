import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import * as nodemailer from 'nodemailer';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private gateway: NotificationsGateway,
  ) {
    this.initMailer();
  }

  private initMailer() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured — email notifications disabled');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
    this.logger.log('SMTP mailer initialized');
  }

  // ── Persist notification to Firestore ──────────────────────

  async persist(userId: string, title: string, body: string, type = 'info', data?: Record<string, unknown>) {
    const db = this.firebaseService.getFirestore();
    await db.collection('notifications').add({
      userId,
      title,
      body,
      type,
      data: data || null,
      read: false,
      createdAt: this.firebaseService.timestamp,
    });
  }

  // ── Push to user via WebSocket ──────────────────────────────

  async sendNotification(userId: string, title: string, body: string, type = 'info', data?: Record<string, unknown>) {
    await this.persist(userId, title, body, type, data);
    this.gateway.notifyUser(userId, { type, title, message: body, data });
    return { success: true };
  }

  // ── Emergency broadcast to all users ───────────────────────

  async sendBroadcast(title: string, body: string, adminId: string) {
    const db = this.firebaseService.getFirestore();

    // Persist to broadcast_announcements
    await db.collection('broadcast_announcements').add({
      title, body, adminId,
      active: true,
      createdAt: this.firebaseService.timestamp,
    });

    // Real-time WebSocket broadcast
    this.gateway.emergencyBroadcast(title, body, adminId);
    this.logger.log(`Emergency broadcast: ${title} by ${adminId}`);
    return { success: true };
  }

  // ── Get active announcements (frontend polling fallback) ────

  async getActiveBroadcasts() {
    const db = this.firebaseService.getFirestore();
    const snap = await db.collection('broadcast_announcements')
      .where('active', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async dismissBroadcast(id: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('broadcast_announcements').doc(id).update({ active: false });
    return { success: true };
  }

  // ── Get user notifications ──────────────────────────────────

  async getUserNotifications(userId: string, limit = 20) {
    const db = this.firebaseService.getFirestore();
    const snap = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async markRead(notificationId: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('notifications').doc(notificationId).update({ read: true });
    return { success: true };
  }

  async markAllRead(userId: string) {
    const db = this.firebaseService.getFirestore();
    const snap = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
    return { success: true, count: snap.size };
  }

  // ── Email ───────────────────────────────────────────────────

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn(`Email not sent (SMTP unconfigured): ${subject} → ${to}`);
      return { success: false, reason: 'SMTP not configured' };
    }
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `NEWGAME <${process.env.SMTP_USER}>`,
        to, subject, html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`Email failed: ${err}`);
      return { success: false, error: String(err) };
    }
  }

  // ── Event reminder ──────────────────────────────────────────

  async sendEventReminder(eventId: string) {
    const db = this.firebaseService.getFirestore();
    const eventSnap = await db.collection('events').doc(eventId).get();
    if (!eventSnap.exists) return { success: false };

    const event = eventSnap.data();
    const usersSnap = await db.collection('users').where('status', 'in', ['active', 'npc']).get();

    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data();
      await this.sendNotification(
        userDoc.id,
        `Reminder: ${event.name}`,
        `Event "${event.name}" akan segera dimulai. Jangan lupa hadir!`,
        'event',
        { eventId },
      );
      // Email jika user punya email
      if (user.email) {
        await this.sendEmail(
          user.email,
          `[NEWGAME] Reminder: ${event.name}`,
          `<p>Halo ${user.username || 'Member'},</p>
           <p>Event <strong>${event.name}</strong> akan segera dimulai.</p>
           <p>Pastikan kamu hadir dan scan QR code untuk mendapatkan XP!</p>
           <p>— NEWGAME Team</p>`,
        );
      }
    }
    return { success: true, notified: usersSnap.size };
  }
}
