/**
 * AttendanceSyncService â€” NEWGAME v0.1.1
 *
 * Resiliensi presensi QR saat jaringan tidak stabil.
 * - Menyimpan scan yang gagal ke localStorage
 * - Retry otomatis saat koneksi pulih
 * - Expire scan lama (>1 jam)
 * - Max 3 retry per scan
 */

const STORAGE_KEY = 'ng-pending-attendance';
const MAX_RETRY = 3;
const EXPIRE_MS = 60 * 60 * 1000; // 1 jam

export interface PendingScan {
  qr_token: string;
  scanned_at: string; // ISO timestamp
  event_id: string;
  retry_count: number;
  device_fingerprint: string;
}

export class AttendanceSyncService {
  private isProcessing = false;
  private onlineHandler: (() => void) | null = null;

  /** Initialize â€” register listeners and process any pending scans */
  init() {
    this.clearExpired();
    this.processPendingScans();

    // Re-process when connection is restored
    this.onlineHandler = () => {
      console.log('[AttendanceSync] Koneksi pulih â€” mencoba sinkronisasi...');
      this.processPendingScans();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onlineHandler);
    }
  }

  /** Cleanup listeners */
  destroy() {
    if (this.onlineHandler && typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineHandler);
    }
  }

  /** Queue a failed scan for retry */
  queueScan(scan: Omit<PendingScan, 'retry_count'>): void {
    const pending = this.getPending();
    const exists = pending.some(p => p.qr_token === scan.qr_token);
    if (exists) return; // Already queued

    pending.push({ ...scan, retry_count: 0 });
    this.savePending(pending);
    console.log(`[AttendanceSync] Scan di-queue: ${scan.qr_token}`);
  }

  /** Get count of pending scans */
  getPendingCount(): number {
    return this.getPending().length;
  }

  /** Process all pending scans â€” called on app load and online event */
  async processPendingScans(): Promise<{ success: number; failed: number; remaining: number }> {
    if (this.isProcessing) return { success: 0, failed: 0, remaining: this.getPendingCount() };
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: 0, failed: 0, remaining: this.getPendingCount() };
    }

    this.isProcessing = true;
    const pending = this.getPending();
    let success = 0;
    let failed = 0;

    // Clean expired first
    this.clearExpired();
    const activePending = this.getPending();

    for (const scan of activePending) {
      try {
        const res = await fetch(`/api/attendance/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenId: scan.qr_token,
            deviceFingerprint: scan.device_fingerprint,
          }),
        });

        if (res.ok || res.status === 409) {
          // 200 OK or 409 Conflict (already recorded) = success
          this.removeScan(scan.qr_token);
          success++;
          console.log(`[AttendanceSync] âœ“ Berhasil sinkronisasi: ${scan.qr_token}`);
        } else if (res.status === 403) {
          // Permanent failure (e.g., token expired, already attended)
          const body = await res.json().catch(() => ({}));
          const permanentErrors = ['TOKEN_USED', 'TOKEN_EXPIRED', 'ALREADY_ATTENDED'];
          if (permanentErrors.some(e => body.message?.includes(e))) {
            this.removeScan(scan.qr_token);
            console.log(`[AttendanceSync] âœ— Scan dihapus (permanent error): ${scan.qr_token}`);
          } else {
            this.incrementRetry(scan.qr_token);
            failed++;
          }
        } else {
          this.incrementRetry(scan.qr_token);
          failed++;
        }
      } catch {
        this.incrementRetry(scan.qr_token);
        failed++;
      }
    }

    this.isProcessing = false;
    return { success, failed, remaining: this.getPendingCount() };
  }

  // â”€â”€ Private helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private getPending(): PendingScan[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private savePending(scans: PendingScan[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
    } catch {
      console.warn('[AttendanceSync] localStorage penuh');
    }
  }

  private removeScan(qrToken: string): void {
    const pending = this.getPending().filter(s => s.qr_token !== qrToken);
    this.savePending(pending);
  }

  private incrementRetry(qrToken: string): void {
    const pending = this.getPending();
    const scan = pending.find(s => s.qr_token === qrToken);
    if (scan) {
      scan.retry_count++;
      if (scan.retry_count >= MAX_RETRY) {
        // Max retries exceeded â€” remove
        this.removeScan(qrToken);
        console.warn(`[AttendanceSync] Max retry untuk ${qrToken} â€” dihapus dari queue`);
        return;
      }
    }
    this.savePending(pending);
  }

  /** Remove scans older than 1 hour */
  private clearExpired(): void {
    const now = Date.now();
    const pending = this.getPending().filter(scan => {
      const age = now - new Date(scan.scanned_at).getTime();
      if (age > EXPIRE_MS) {
        console.log(`[AttendanceSync] Expired: ${scan.qr_token}`);
        return false;
      }
      return true;
    });
    this.savePending(pending);
  }
}

// Singleton instance
export const attendanceSync = new AttendanceSyncService();
