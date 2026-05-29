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
var UserHistoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHistoryService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
const hash_util_1 = require("../../common/utils/hash.util");
let UserHistoryService = UserHistoryService_1 = class UserHistoryService {
    constructor(firebase) {
        this.firebase = firebase;
        this.logger = new common_1.Logger(UserHistoryService_1.name);
    }
    async write(entry) {
        try {
            const diffHash = (0, hash_util_1.sha256)(JSON.stringify(entry.before) + JSON.stringify(entry.after));
            const timestamp = new Date().toISOString();
            const ref = await this.firebase.firestore
                .collection('user_history')
                .add({ ...entry, diffHash, timestamp, serverTs: this.firebase.timestamp });
            return ref.id;
        }
        catch (err) {
            this.logger.error('UserHistory write failed', err);
            return '';
        }
    }
    async getByUser(userId, limit = 20) {
        try {
            const snap = await this.firebase.firestore
                .collection('user_history')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(Math.min(limit, 100))
                .get();
            return snap.docs.map(d => ({ historyId: d.id, ...d.data() }));
        }
        catch {
            return [];
        }
    }
    async getRecent(limit = 50) {
        try {
            const snap = await this.firebase.firestore
                .collection('user_history')
                .orderBy('timestamp', 'desc')
                .limit(Math.min(limit, 200))
                .get();
            return snap.docs.map(d => ({ historyId: d.id, ...d.data() }));
        }
        catch {
            return [];
        }
    }
};
exports.UserHistoryService = UserHistoryService;
exports.UserHistoryService = UserHistoryService = UserHistoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], UserHistoryService);
//# sourceMappingURL=user-history.service.js.map