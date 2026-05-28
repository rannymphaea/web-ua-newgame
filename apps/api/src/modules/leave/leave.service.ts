import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class LeaveService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Request leave (izin tidak hadir)
   */
  async createLeaveRequest(userId: string, data: {
    eventId: string;
    reason: string;
    type: 'sick' | 'personal' | 'academic' | 'other';
  }) {
    const db = this.firebaseService.getFirestore();

    // Verify event exists
    const eventDoc = await db.collection('events').doc(data.eventId).get();
    if (!eventDoc.exists) {
      throw new NotFoundException('Event not found');
    }

    // Check if already has leave request for this event
    const existing = await db.collection('leaveRequests')
      .where('userId', '==', userId)
      .where('eventId', '==', data.eventId)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new BadRequestException('Leave request already exists for this event');
    }

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const leaveRef = db.collection('leaveRequests').doc();
    await leaveRef.set({
      userId,
      userName: userData?.name || 'Unknown',
      eventId: data.eventId,
      eventName: eventDoc.data()?.name || 'Unknown Event',
      reason: data.reason,
      type: data.type,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { id: leaveRef.id, message: 'Leave request submitted' };
  }

  /**
   * Get leave requests — admin sees all, user sees own
   */
  async getLeaveRequests(userId: string, role: string, filters?: {
    status?: string;
    eventId?: string;
    limit?: number;
  }) {
    const db = this.firebaseService.getFirestore();
    let ref: FirebaseFirestore.Query = db.collection('leaveRequests');

    if (role !== 'admin' && role !== 'superadmin') {
      ref = ref.where('userId', '==', userId);
    }

    if (filters?.status) {
      ref = ref.where('status', '==', filters.status);
    }
    if (filters?.eventId) {
      ref = ref.where('eventId', '==', filters.eventId);
    }

    ref = ref.orderBy('createdAt', 'desc').limit(filters?.limit || 50);

    const snap = await ref.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  /**
   * Approve/reject leave request — admin only
   */
  async updateLeaveStatus(
    leaveId: string,
    adminId: string,
    status: 'approved' | 'rejected',
    adminNote?: string,
  ) {
    const db = this.firebaseService.getFirestore();
    const leaveRef = db.collection('leaveRequests').doc(leaveId);
    const leaveDoc = await leaveRef.get();

    if (!leaveDoc.exists) {
      throw new NotFoundException('Leave request not found');
    }

    const leaveData = leaveDoc.data();
    if (leaveData.status !== 'pending') {
      throw new BadRequestException(`Leave request already ${leaveData.status}`);
    }

    await leaveRef.update({
      status,
      reviewedBy: adminId,
      adminNote: adminNote || '',
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });

    // Log the action
    await db.collection('logs').add({
      userId: adminId,
      action: `leave_${status}`,
      targetUserId: leaveData.userId,
      leaveId,
      eventId: leaveData.eventId,
      timestamp: new Date(),
    });

    return { message: `Leave request ${status}` };
  }
}
