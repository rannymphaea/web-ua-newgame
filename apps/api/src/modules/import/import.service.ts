import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { UserHistoryService } from '../user-history/user-history.service';
import { UserVaultService } from '../user-vault/user-vault.service';

export interface ImportRow {
  name: string; email: string; username?: string;
  division?: string; role?: string; memberId?: string; status?: string;
}

export interface ImportResult {
  total: number; inserted: number; skipped: number;
  errors: Array<{ row: number; email: string; reason: string }>;
  dryRun: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    private readonly firebase: FirebaseService,
    private readonly history:  UserHistoryService,
    private readonly vault:    UserVaultService,
  ) {}

  parseCSV(buffer: Buffer): ImportRow[] {
    const lines = buffer.toString('utf-8').replace(/\r/g, '').split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new BadRequestException('CSV needs header + at least 1 data row');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ''; });
      return row as unknown as ImportRow;
    });
  }

  async importRows(rows: ImportRow[], importedBy: string, dryRun = false): Promise<ImportResult> {
    const db     = this.firebase.firestore;
    const result: ImportResult = { total: rows.length, inserted: 0, skipped: 0, errors: [], dryRun };

    const existSnap = await db.collection('users').select('email').get();
    const existing  = new Set(existSnap.docs.map(d => (d.data().email || '').toLowerCase()));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]; const rowNum = i + 2;
      if (!row.name?.trim() || !row.email?.trim()) {
        result.errors.push({ row: rowNum, email: row.email || '', reason: 'Missing name or email' }); continue;
      }
      const email = row.email.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        result.errors.push({ row: rowNum, email, reason: 'Invalid email format' }); continue;
      }
      if (existing.has(email)) { result.skipped++; continue; }

      if (!dryRun) {
        try {
          const now  = new Date().toISOString();
          const data = {
            name: row.name.trim(), email,
            username: row.username?.trim().toLowerCase() || '',
            division: row.division?.trim() || '', role: row.role?.trim() || 'member',
            memberId: row.memberId?.trim() || '', status: row.status?.trim() || 'active',
            xpCache: 0, streak: 0, attendanceCount: 0,
            createdAt: now, updatedAt: now, createdBy: importedBy, importedAt: now,
          };
          const ref = await db.collection('users').add({ ...data, serverTs: this.firebase.timestamp });
          existing.add(email);
          await Promise.all([
            this.history.write({ userId: ref.id, changedBy: importedBy, action: 'batch_import', before: {}, after: data, changedFields: Object.keys(data) }),
            this.vault.saveVersion(ref.id, data, importedBy),
          ]);
          result.inserted++;
        } catch (err) { result.errors.push({ row: rowNum, email, reason: String(err) }); }
      } else { result.inserted++; }
    }

    if (!dryRun) {
      try {
        await db.collection('import_logs').add({ importedBy, ...result, timestamp: new Date().toISOString(), serverTs: this.firebase.timestamp });
      } catch { /* non-critical */ }
    }
    return result;
  }

  async getLastImportSummary() {
    try {
      const snap = await this.firebase.firestore.collection('import_logs').orderBy('timestamp', 'desc').limit(1).get();
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch { return null; }
  }
}
