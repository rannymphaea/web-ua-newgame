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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
let AttendanceService = class AttendanceService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async processAttendance(userId, tokenId, deviceFingerprint) {
        if (!tokenId || !deviceFingerprint) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        const db = this.firebaseService.firestore;
        try {
            const result = await db.runTransaction(async (transaction) => {
                const tokenRef = db.collection('tokens').doc(tokenId);
                const userRef = db.collection('users').doc(userId);
                const [tokenSnap, userSnap] = await Promise.all([
                    transaction.get(tokenRef),
                    transaction.get(userRef),
                ]);
                if (!tokenSnap.exists)
                    throw new Error('TOKEN_NOT_FOUND');
                const token = tokenSnap.data();
                if (token.used)
                    throw new Error('TOKEN_USED');
                const now = this.firebaseService.timestampNow;
                if (now.toMillis() > token.expiresAt.toMillis()) {
                    throw new Error('TOKEN_EXPIRED');
                }
                if (token.deviceFingerprint && token.deviceFingerprint !== deviceFingerprint) {
                    throw new Error('DEVICE_MISMATCH');
                }
                const eventRef = db.collection('events').doc(token.eventId);
                const eventSnap = await transaction.get(eventRef);
                if (!eventSnap.exists)
                    throw new Error('EVENT_NOT_FOUND');
                const event = eventSnap.data();
                if (event.status !== 'active')
                    throw new Error('EVENT_NOT_ACTIVE');
                if (!userSnap.exists)
                    throw new Error('USER_NOT_FOUND');
                const user = userSnap.data();
                if (user.status !== 'active' && user.status !== 'npc') {
                    throw new Error('USER_NOT_ACTIVE');
                }
                const attendanceId = `${token.eventId}_${userId}`;
                const attendanceRef = db.collection('attendance').doc(attendanceId);
                const attendanceSnap = await transaction.get(attendanceRef);
                if (attendanceSnap.exists)
                    throw new Error('ALREADY_ATTENDED');
                const xpReward = event.xpReward || 10;
                const currentXP = user.xpCache || 0;
                const currentStreak = user.streak || 0;
                const lastAttended = user.lastAttendedAt;
                let newStreak = 1;
                let streakBonus = 0;
                if (lastAttended) {
                    const lastDate = lastAttended.toDate();
                    const diffDays = Math.floor((now.toDate().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 7) {
                        newStreak = currentStreak + 1;
                        if (newStreak % 5 === 0)
                            streakBonus = 5;
                    }
                }
                const totalXP = currentXP + xpReward + streakBonus;
                transaction.update(tokenRef, {
                    used: true,
                    usedBy: userId,
                    usedAt: now,
                    deviceFingerprint: deviceFingerprint,
                });
                transaction.set(attendanceRef, {
                    eventId: token.eventId,
                    eventName: event.name,
                    userId: userId,
                    status: 'present',
                    xpChange: xpReward + streakBonus,
                    streakBonus: streakBonus,
                    deviceFingerprint: deviceFingerprint,
                    attendedAt: now,
                });
                transaction.update(userRef, {
                    xpCache: totalXP,
                    attendanceCount: (user.attendanceCount || 0) + 1,
                    streak: newStreak,
                    lastAttendedAt: now,
                });
                return {
                    success: true,
                    xpGained: xpReward + streakBonus,
                    streakBonus,
                    newStreak,
                    totalXP,
                    eventName: event.name,
                };
            });
            await db.collection('logs').add({
                userId,
                action: 'attend',
                result: 'success',
                deviceFingerprint,
                timestamp: this.firebaseService.timestamp,
            });
            return result;
        }
        catch (error) {
            await db.collection('logs').add({
                userId,
                action: 'attend',
                result: 'failed',
                reason: error.message,
                timestamp: this.firebaseService.timestamp,
            });
            await this.checkAnomaly(userId, error.message, deviceFingerprint);
            const errorMessages = {
                TOKEN_NOT_FOUND: 'Invalid QR code',
                TOKEN_USED: 'QR code already used',
                TOKEN_EXPIRED: 'QR code expired',
                DEVICE_MISMATCH: 'Device not recognized',
                EVENT_NOT_FOUND: 'Event not found',
                EVENT_NOT_ACTIVE: 'Event is not active',
                USER_NOT_FOUND: 'Account not found',
                USER_NOT_ACTIVE: 'Account is not active',
                ALREADY_ATTENDED: 'You have already attended this event',
            };
            throw new common_1.ForbiddenException(errorMessages[error.message] || 'Attendance failed');
        }
    }
    async getAttendanceHistory(userId, limit = 20) {
        const db = this.firebaseService.firestore;
        const snapshot = await db
            .collection('attendance')
            .where('userId', '==', userId)
            .orderBy('attendedAt', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async checkAttendance(userId, eventId) {
        const db = this.firebaseService.firestore;
        const attendanceId = `${eventId}_${userId}`;
        const doc = await db.collection('attendance').doc(attendanceId).get();
        return { attended: doc.exists };
    }
    async getEventAttendance(eventId) {
        const db = this.firebaseService.firestore;
        const snapshot = await db
            .collection('attendance')
            .where('eventId', '==', eventId)
            .orderBy('attendedAt', 'desc')
            .get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async checkAnomaly(userId, reason, deviceFingerprint) {
        try {
            const db = this.firebaseService.firestore;
            const now = this.firebaseService.timestampNow;
            const fiveMinutesAgo = this.firebaseService.createTimestamp(now.seconds - 300, 0);
            const recentFails = await db
                .collection('logs')
                .where('userId', '==', userId)
                .where('result', '==', 'failed')
                .where('timestamp', '>', fiveMinutesAgo)
                .get();
            let score = 0;
            const reasons = [reason];
            if (recentFails.size >= 3) {
                score += 2;
                reasons.push('multiple_failures');
            }
            if (reason === 'DEVICE_MISMATCH') {
                score += 3;
            }
            if (reason === 'TOKEN_USED') {
                score += 3;
                reasons.push('token_reuse_attempt');
            }
            if (score >= 4) {
                await db.collection('anomalies').add({
                    userId,
                    score,
                    reasons,
                    deviceFingerprint,
                    timestamp: this.firebaseService.timestamp,
                });
                if (score >= 8) {
                    await db.collection('users').doc(userId).update({
                        status: 'suspended',
                        suspendedAt: this.firebaseService.timestamp,
                        suspendReason: 'anomaly_detected',
                    });
                }
            }
        }
        catch (error) {
            console.error('Check anomaly error:', error);
        }
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map