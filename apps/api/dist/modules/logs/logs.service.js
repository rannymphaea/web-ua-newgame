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
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
let LogsService = class LogsService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getLogs(filters) {
        const db = this.firebaseService.getFirestore();
        let ref = db.collection('logs');
        if (filters?.action) {
            ref = ref.where('action', '==', filters.action);
        }
        if (filters?.userId) {
            ref = ref.where('userId', '==', filters.userId);
        }
        if (filters?.startDate) {
            ref = ref.where('timestamp', '>=', new Date(filters.startDate));
        }
        if (filters?.endDate) {
            ref = ref.where('timestamp', '<=', new Date(filters.endDate));
        }
        ref = ref.orderBy('timestamp', 'desc').limit(filters?.limit || 100);
        if (filters?.offset) {
            ref = ref.offset(filters.offset);
        }
        const snap = await ref.get();
        return {
            logs: snap.docs.map(d => ({ id: d.id, ...d.data() })),
            total: snap.size,
        };
    }
    async createLog(data) {
        const db = this.firebaseService.getFirestore();
        const logRef = db.collection('logs').doc();
        await logRef.set({
            ...data,
            timestamp: new Date(),
        });
        return { id: logRef.id };
    }
    async exportLogs(filters) {
        const db = this.firebaseService.getFirestore();
        let ref = db.collection('logs');
        if (filters?.action) {
            ref = ref.where('action', '==', filters.action);
        }
        if (filters?.startDate) {
            ref = ref.where('timestamp', '>=', new Date(filters.startDate));
        }
        if (filters?.endDate) {
            ref = ref.where('timestamp', '<=', new Date(filters.endDate));
        }
        ref = ref.orderBy('timestamp', 'desc');
        const snap = await ref.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], LogsService);
//# sourceMappingURL=logs.service.js.map