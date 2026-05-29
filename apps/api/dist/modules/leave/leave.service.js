"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
let LeaveService = class LeaveService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async createLeaveRequest(userId, data) {
        const db = this.firebaseService.getFirestore();
        const eventDoc = await db.collection('events').doc(data.eventId).get();
        if (!eventDoc.exists) {
            throw new common_1.NotFoundException('Event not found');
        }
        const existing = await db.collection('leaveRequests')
            .where('userId', '==', userId)
            .where('eventId', '==', data.eventId)
            .limit(1)
            .get();
        if (!existing.empty) {
            throw new common_1.BadRequestException('Leave request already exists for this event');
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
    async getLeaveRequests(userId, role, filters) {
        const db = this.firebaseService.getFirestore();
        let ref = db.collection('leaveRequests');
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
    async updateLeaveStatus(leaveId, adminId, status, adminNote) {
        const db = this.firebaseService.getFirestore();
        const leaveRef = db.collection('leaveRequests').doc(leaveId);
        const leaveDoc = await leaveRef.get();
        if (!leaveDoc.exists) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        const leaveData = leaveDoc.data();
        if (leaveData.status !== 'pending') {
            throw new common_1.BadRequestException(`Leave request already ${leaveData.status}`);
        }
        await leaveRef.update({
            status,
            reviewedBy: adminId,
            adminNote: adminNote || '',
            reviewedAt: new Date(),
            updatedAt: new Date(),
        });
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
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map