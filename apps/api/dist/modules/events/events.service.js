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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
let EventsService = class EventsService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async createEvent(creatorId, data) {
        const db = this.firebaseService.firestore;
        const eventRef = db.collection('events').doc();
        await eventRef.set({
            name: data.name,
            description: data.description || '',
            xpReward: data.xpReward || 10,
            xpPenalty: data.xpPenalty || 5,
            status: 'active',
            createdBy: creatorId,
            startTime: this.firebaseService.timestamp,
            endTime: null,
            closedBy: null,
            xpDistributed: false,
            createdAt: this.firebaseService.timestamp,
        });
        await db.collection('logs').add({
            userId: creatorId,
            eventId: eventRef.id,
            action: 'create_event',
            result: 'success',
            timestamp: this.firebaseService.timestamp,
        });
        return { success: true, eventId: eventRef.id };
    }
    async getEvents(status, limit = 20) {
        const db = this.firebaseService.firestore;
        let query = db.collection('events').orderBy('createdAt', 'desc');
        if (status) {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.limit(limit).get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async generateToken(eventId, creatorId) {
        const db = this.firebaseService.firestore;
        const eventSnap = await db.collection('events').doc(eventId).get();
        if (!eventSnap.exists || eventSnap.data().status !== 'active') {
            throw new common_1.BadRequestException('Event is not active');
        }
        const oldTokens = await db
            .collection('tokens')
            .where('eventId', '==', eventId)
            .where('used', '==', false)
            .get();
        const invalidateBatch = db.batch();
        oldTokens.docs.forEach((doc) => {
            invalidateBatch.update(doc.ref, {
                used: true,
                invalidatedAt: this.firebaseService.timestamp,
            });
        });
        await invalidateBatch.commit();
        const tokenId = this.generateSecureToken();
        const now = this.firebaseService.timestampNow;
        const expiresAt = this.firebaseService.createTimestamp(now.seconds + 12, now.nanoseconds);
        await db.collection('tokens').doc(tokenId).set({
            tokenId,
            eventId,
            createdAt: this.firebaseService.timestamp,
            expiresAt,
            used: false,
            usedBy: null,
            deviceFingerprint: null,
            createdBy: creatorId,
        });
        return { success: true, tokenId, expiresAt: expiresAt.toMillis() };
    }
    async closeEvent(eventId, requesterId, requesterRole, approverId) {
        const db = this.firebaseService.firestore;
        const eventRef = db.collection('events').doc(eventId);
        const eventSnap = await eventRef.get();
        if (!eventSnap.exists)
            throw new common_1.NotFoundException('Event not found');
        const event = eventSnap.data();
        if (event.status !== 'active')
            throw new common_1.BadRequestException('Event is not active');
        if (requesterRole === 'admin') {
            if (!approverId || approverId === requesterId) {
                throw new common_1.ForbiddenException('Requires approval from another admin');
            }
        }
        await eventRef.update({
            status: 'closed',
            endTime: this.firebaseService.timestamp,
            closedBy: requesterId,
            xpDistributed: false,
        });
        const usersSnap = await db
            .collection('users')
            .where('status', 'in', ['active', 'npc'])
            .get();
        const attendanceSnap = await db
            .collection('attendance')
            .where('eventId', '==', eventId)
            .get();
        const presentUserIds = new Set(attendanceSnap.docs.map((d) => d.data().userId));
        const batch = db.batch();
        for (const userDoc of usersSnap.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();
            if (userData.createdAt && event.startTime) {
                if (userData.createdAt.toMillis() > event.startTime.toMillis())
                    continue;
            }
            const isPresent = presentUserIds.has(userId);
            if (!isPresent) {
                const xpPenalty = event.xpPenalty || 5;
                const currentXP = userData.xpCache || 0;
                const newXP = Math.max(0, currentXP - xpPenalty);
                batch.update(db.collection('users').doc(userId), { xpCache: newXP });
                const attendanceId = `${eventId}_${userId}`;
                batch.set(db.collection('attendance').doc(attendanceId), {
                    eventId,
                    eventName: event.name,
                    userId,
                    status: 'absent',
                    xpChange: -xpPenalty,
                    attendedAt: this.firebaseService.timestamp,
                });
                batch.set(db.collection('xpHistory').doc(), {
                    userId,
                    eventId,
                    change: -xpPenalty,
                    reason: 'absent',
                    changedBy: 'system',
                    timestamp: this.firebaseService.timestamp,
                });
            }
        }
        await batch.commit();
        await eventRef.update({ xpDistributed: true });
        await db.collection('logs').add({
            userId: requesterId,
            eventId,
            action: 'close_event',
            result: 'success',
            timestamp: this.firebaseService.timestamp,
        });
        return { success: true, message: 'Event closed successfully' };
    }
    generateSecureToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars[Math.floor(Math.random() * chars.length)];
        }
        return token;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], EventsService);
//# sourceMappingURL=events.service.js.map