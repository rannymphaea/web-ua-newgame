// ============================================================
// NOTIFICATIONS MODULE -- PLACEHOLDER
// ============================================================
// Modul ini adalah placeholder untuk sistem notifikasi.
// Untuk mengaktifkan:
// 1. Setup Firebase Cloud Messaging di Firebase Console
// 2. Download FCM Server Key
// 3. Implementasi push notification di service
// ============================================================
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendNotification(userId: string, title: string, body: string) {
    // PLACEHOLDER: Implementasi FCM push notification di sini
    this.logger.log(`[PLACEHOLDER] Notification to ${userId}: ${title}`);
    return { success: true, note: 'Notification service belum dikonfigurasi' };
  }

  async sendBroadcast(title: string, body: string) {
    this.logger.log(`[PLACEHOLDER] Broadcast: ${title}`);
    return { success: true, note: 'Broadcast belum dikonfigurasi' };
  }

  async sendEventReminder(eventId: string) {
    this.logger.log(`[PLACEHOLDER] Event reminder: ${eventId}`);
    return { success: true, note: 'Reminder belum dikonfigurasi' };
  }
}
