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
exports.BadgesService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
const badge_definitions_1 = require("./badge-definitions");
let BadgesService = class BadgesService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    getDefinitions() {
        return { badges: badge_definitions_1.BADGES, rarities: badge_definitions_1.BADGE_RARITIES, categories: badge_definitions_1.BADGE_CATEGORIES };
    }
    async getUserBadges(userId) {
        const db = this.firebaseService.firestore;
        const snap = await db.collection('user_badges').where('userId', '==', userId).get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async checkAndAward(userId) {
        const db = this.firebaseService.firestore;
        const userSnap = await db.collection('users').doc(userId).get();
        if (!userSnap.exists)
            return [];
        const user = userSnap.data();
        const existing = await this.getUserBadges(userId);
        const existingIds = existing.map((b) => b.badgeId);
        const awarded = [];
        const stats = {
            attendanceCount: user.attendanceCount || 0,
            streak: user.streak || 0,
            xpCache: user.xpCache || 0,
            level: Math.floor((user.xpCache || 0) / 100) + 1,
            hasLoggedIn: 1,
            profileComplete: (user.username && user.photoURL) ? 1 : 0,
        };
        for (const badge of badge_definitions_1.BADGES) {
            if (badge.condition.type !== 'auto')
                continue;
            if (existingIds.includes(badge.id))
                continue;
            if (!badge.condition.check || !badge.condition.value)
                continue;
            const userVal = stats[badge.condition.check] || 0;
            if (badge.condition.check === 'leaderboardRank')
                continue;
            if (userVal >= badge.condition.value) {
                await db.collection('user_badges').add({
                    userId,
                    badgeId: badge.id,
                    awardedAt: this.firebaseService.timestamp,
                    source: 'auto',
                });
                awarded.push(badge.id);
            }
        }
        return awarded;
    }
    async awardBadge(userId, badgeId, awardedBy) {
        const db = this.firebaseService.firestore;
        const badge = badge_definitions_1.BADGES.find(b => b.id === badgeId);
        if (!badge)
            throw new Error('Badge not found');
        const existing = await db.collection('user_badges')
            .where('userId', '==', userId)
            .where('badgeId', '==', badgeId)
            .get();
        if (!existing.empty)
            throw new Error('Badge already awarded');
        await db.collection('user_badges').add({
            userId,
            badgeId,
            awardedAt: this.firebaseService.timestamp,
            awardedBy,
            source: 'manual',
        });
        return { success: true, badge: badge.name };
    }
    async revokeBadge(userId, badgeId) {
        const db = this.firebaseService.firestore;
        const snap = await db.collection('user_badges')
            .where('userId', '==', userId)
            .where('badgeId', '==', badgeId)
            .get();
        for (const doc of snap.docs) {
            await doc.ref.delete();
        }
        return { success: true };
    }
};
exports.BadgesService = BadgesService;
exports.BadgesService = BadgesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], BadgesService);
//# sourceMappingURL=badges.service.js.map