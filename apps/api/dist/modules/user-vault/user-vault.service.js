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
var UserVaultService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserVaultService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
const hash_util_1 = require("../../common/utils/hash.util");
let UserVaultService = UserVaultService_1 = class UserVaultService {
    constructor(firebase) {
        this.firebase = firebase;
        this.logger = new common_1.Logger(UserVaultService_1.name);
    }
    async saveVersion(userId, snapshot, changedBy) {
        try {
            const col = this.firebase.firestore.collection('user_vault').doc(userId).collection('versions');
            const lastSnap = await col.orderBy('versionNum', 'desc').limit(1).get();
            const lastDoc = lastSnap.docs[0];
            const prevHash = lastDoc?.data()?.hashChain ?? '0000000000000000';
            const versionNum = (lastDoc?.data()?.versionNum ?? 0) + 1;
            const chain = (0, hash_util_1.hashChain)(prevHash, snapshot);
            const ref = await col.add({ userId, versionNum, snapshot, prevHash, hashChain: chain, createdAt: new Date().toISOString(), changedBy, serverTs: this.firebase.timestamp });
            return ref.id;
        }
        catch (err) {
            this.logger.error('UserVault saveVersion failed', err);
            return '';
        }
    }
    async getVersions(userId, limit = 20) {
        try {
            const snap = await this.firebase.firestore.collection('user_vault').doc(userId).collection('versions')
                .orderBy('versionNum', 'desc').limit(Math.min(limit, 50)).get();
            return snap.docs.map(d => ({ versionId: d.id, ...d.data() }));
        }
        catch {
            return [];
        }
    }
    async getLatest(userId) {
        try {
            const snap = await this.firebase.firestore.collection('user_vault').doc(userId).collection('versions')
                .orderBy('versionNum', 'desc').limit(1).get();
            if (snap.empty)
                return null;
            return { versionId: snap.docs[0].id, ...snap.docs[0].data() };
        }
        catch {
            return null;
        }
    }
    async getDiff(userId, vA, vB) {
        try {
            const snap = await this.firebase.firestore.collection('user_vault').doc(userId).collection('versions')
                .where('versionNum', 'in', [vA, vB]).get();
            const docs = snap.docs.map(d => ({ num: d.data().versionNum, snap: d.data().snapshot }));
            const a = docs.find(d => d.num === vA)?.snap ?? {};
            const b = docs.find(d => d.num === vB)?.snap ?? {};
            const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
            const diff = {};
            for (const k of allKeys) {
                if (JSON.stringify(a[k]) !== JSON.stringify(b[k]))
                    diff[k] = { from: a[k], to: b[k] };
            }
            return { versionA: vA, versionB: vB, diff };
        }
        catch {
            return { versionA: vA, versionB: vB, diff: {} };
        }
    }
};
exports.UserVaultService = UserVaultService;
exports.UserVaultService = UserVaultService = UserVaultService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], UserVaultService);
//# sourceMappingURL=user-vault.service.js.map