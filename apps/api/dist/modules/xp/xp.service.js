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
exports.XpService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
let XpService = class XpService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async editXPManual(targetUserId, newXP, reason, editorId, editorRole) {
        if (typeof newXP !== 'number' || newXP < 0) {
            throw new common_1.BadRequestException('Invalid XP value');
        }
        if (!reason || reason.trim().length < 5) {
            throw new common_1.BadRequestException('Reason is required (min 5 characters)');
        }
        const db = this.firebaseService.firestore;
        const userRef = db.collection('users').doc(targetUserId);
        const userSnap = await userRef.get();
        if (!userSnap.exists)
            throw new common_1.NotFoundException('User not found');
        const oldXP = userSnap.data().xpCache || 0;
        await userRef.update({ xpCache: newXP });
        await db.collection('xpHistory').add({
            userId: targetUserId,
            oldXP,
            newXP,
            change: newXP - oldXP,
            reason: reason.trim(),
            changedBy: editorId,
            changedByRole: editorRole,
            type: 'manual',
            timestamp: this.firebaseService.timestamp,
        });
        await db.collection('logs').add({
            userId: editorId,
            targetUserId,
            action: 'manual_xp_edit',
            result: 'success',
            oldXP,
            newXP,
            reason,
            timestamp: this.firebaseService.timestamp,
        });
        return { success: true, oldXP, newXP };
    }
    async getXPHistory(userId, limit = 30) {
        const db = this.firebaseService.firestore;
        const snapshot = await db
            .collection('xpHistory')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
};
exports.XpService = XpService;
exports.XpService = XpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], XpService);
//# sourceMappingURL=xp.service.js.map