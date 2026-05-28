import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class ExportService {
  constructor(private firebaseService: FirebaseService) {}

  async exportAttendanceCSV(eventId?: string) {
    const db = this.firebaseService.firestore;
    let query: any = db.collection('attendance').orderBy('attendedAt', 'desc');
    if (eventId) query = query.where('eventId', '==', eventId);
    const snap = await query.limit(1000).get();

    const header = 'userId,eventId,status,attendedAt\n';
    const rows = snap.docs.map(d => {
      const data = d.data();
      return `${data.userId},${data.eventId},${data.status},${data.attendedAt?.toDate?.()?.toISOString() || ''}`;
    }).join('\n');

    return header + rows;
  }

  async exportMembersCSV() {
    const db = this.firebaseService.firestore;
    const snap = await db.collection('members').orderBy('name', 'asc').get();

    const header = 'memberId,name,division,pillar,generation,status\n';
    const rows = snap.docs.map(d => {
      const data = d.data();
      return `${data.memberId || ''},${data.name || ''},${data.division || ''},${data.pillar || ''},${data.generation || ''},${data.status || ''}`;
    }).join('\n');

    return header + rows;
  }

  async exportUsersCSV() {
    const db = this.firebaseService.firestore;
    const snap = await db.collection('users').orderBy('displayName', 'asc').get();

    const header = 'uid,displayName,email,role,xp,attendanceCount,streak\n';
    const rows = snap.docs.map(d => {
      const data = d.data();
      return `${d.id},${data.displayName || ''},${data.email || ''},${data.role || ''},${data.xpCache || 0},${data.attendanceCount || 0},${data.streak || 0}`;
    }).join('\n');

    return header + rows;
  }
}
