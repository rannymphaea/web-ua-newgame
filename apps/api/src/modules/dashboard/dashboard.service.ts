import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { ImportService } from '../import/import.service';
import { UserHistoryService } from '../user-history/user-history.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly firebase:   FirebaseService,
    private readonly importSvc:  ImportService,
    private readonly historySvc: UserHistoryService,
  ) {}

  async getStats() {
    try {
      const db = this.firebase.firestore;
      const [totalSnap, activeSnap, recentChanges, lastImport] = await Promise.all([
        db.collection('users').count().get(),
        db.collection('users').where('status', '==', 'active').count().get(),
        this.historySvc.getRecent(10),
        this.importSvc.getLastImportSummary(),
      ]);
      return {
        ok:                true,
        totalUsers:        totalSnap.data().count,
        totalMembers:      activeSnap.data().count,
        recentChanges,
        lastImportSummary: lastImport,
      };
    } catch (err) {
      this.logger.error('Dashboard stats failed', err);
      return { ok: false, error: String(err) };
    }
  }
}
