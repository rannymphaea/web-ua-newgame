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
const bcrypt = require("bcryptjs");
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
        const isHashed = member.tempPassword?.startsWith('$2');
        const passwordMatch = isHashed
            ? await bcrypt.compare(tempPassword, member.tempPassword)
            : member.tempPassword === tempPassword;
        if (!passwordMatch) {
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
    async setUserRole(uid, role, callerRole) {
        const allowedRoles = ['member', 'admin', 'superadmin'];
        if (!allowedRoles.includes(role)) {
            throw new common_1.BadRequestException(`Role '${role}' tidak valid`);
        }
        if (callerRole === 'admin' && role !== 'member') {
            throw new common_1.UnauthorizedException('Admin hanya bisa mengubah role ke member');
        }
        await this.firebaseService.auth.setCustomUserClaims(uid, { role });
        await this.firebaseService.firestore.collection('users').doc(uid).update({ role });
        return { success: true, role };
    }
    async getAllUsers(limit = 100) {
        const snapshot = await this.firebaseService.firestore
            .collection('users')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            displayName: doc.data().displayName || '',
            email: doc.data().email || '',
            memberId: doc.data().memberId || '',
            role: doc.data().role || 'member',
            division: doc.data().division || '',
            status: doc.data().status || 'active',
        }));
    }
    async registerAdmin(data) {
        if (!data.password || data.password.length < 8) {
            throw new common_1.BadRequestException('Password minimal 8 karakter');
        }
        if (!data.email || !data.email.includes('@')) {
            throw new common_1.BadRequestException('Email tidak valid');
        }
        if (!data.displayName || data.displayName.trim().length < 2) {
            throw new common_1.BadRequestException('displayName minimal 2 karakter');
        }
        let uid;
        try {
            const userRecord = await this.firebaseService.auth.createUser({
                email: data.email.trim().toLowerCase(),
                password: data.password,
                displayName: data.displayName.trim(),
                emailVerified: false,
            });
            uid = userRecord.uid;
        }
        catch (e) {
            if (e.code === 'auth/email-already-exists') {
                throw new common_1.BadRequestException('Email sudah terdaftar');
            }
            throw new common_1.BadRequestException(`Firebase error: ${e.message}`);
        }
        const db = this.firebaseService.firestore;
        const now = this.firebaseService.timestamp;
        await this.firebaseService.auth.setCustomUserClaims(uid, { role: 'admin' });
        const batch = db.batch();
        const userRef = db.collection('users').doc(uid);
        batch.set(userRef, {
            email: data.email.trim().toLowerCase(),
            displayName: data.displayName.trim(),
            division: data.division || 'general',
            role: 'admin',
            status: 'active',
            memberId: null,
            xpCache: 0,
            attendanceCount: 0,
            streak: 0,
            createdAt: now,
        });
        const logRef = db.collection('logs').doc();
        batch.set(logRef, {
            userId: uid,
            action: 'register-admin',
            result: 'success',
            email: data.email,
            timestamp: now,
        });
        await batch.commit();
        return {
            success: true,
            uid,
            email: data.email.trim().toLowerCase(),
            displayName: data.displayName.trim(),
            role: 'admin',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map