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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
let AuthService = class AuthService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async verifyMember(memberId, tempPassword) {
        const memberRef = this.firebaseService.firestore.collection('members').doc(memberId);
        const memberSnap = await memberRef.get();
        if (!memberSnap.exists) {
            throw new common_1.NotFoundException('Member ID tidak ditemukan');
        }
        const member = memberSnap.data();
        if (member.isRegistered) {
            throw new common_1.BadRequestException('Member ID sudah terdaftar');
        }
        if (member.tempPassword !== tempPassword) {
            throw new common_1.UnauthorizedException('Password sementara salah');
        }
        return {
            valid: true,
            memberId: member.memberId,
            name: member.name,
            division: member.division,
            team: member.team || '',
            status: member.status,
        };
    }
    async createUserProfile(uid, data) {
        const db = this.firebaseService.firestore;
        const batch = db.batch();
        const userRef = db.collection('users').doc(uid);
        batch.set(userRef, {
            email: data.email,
            displayName: data.displayName,
            memberId: data.memberId,
            division: data.division,
            team: data.team || '',
            role: 'member',
            status: 'active',
            xpCache: 0,
            attendanceCount: 0,
            streak: 0,
            createdAt: this.firebaseService.timestamp,
        });
        const memberRef = db.collection('members').doc(data.memberId);
        batch.update(memberRef, {
            isRegistered: true,
            registeredUserId: uid,
            registeredAt: this.firebaseService.timestamp,
        });
        const logRef = db.collection('logs').doc();
        batch.set(logRef, {
            userId: uid,
            action: 'register',
            result: 'success',
            memberId: data.memberId,
            timestamp: this.firebaseService.timestamp,
        });
        await batch.commit();
        return { success: true };
    }
    async getUserProfile(uid) {
        const userSnap = await this.firebaseService.firestore
            .collection('users')
            .doc(uid)
            .get();
        if (!userSnap.exists) {
            throw new common_1.NotFoundException('User not found');
        }
        return { id: uid, ...userSnap.data() };
    }
    async setUserRole(uid, role) {
        await this.firebaseService.auth.setCustomUserClaims(uid, { role });
        await this.firebaseService.firestore.collection('users').doc(uid).update({
            role: role,
        });
        return { success: true, role };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map