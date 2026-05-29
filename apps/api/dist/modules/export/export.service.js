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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
let ExportService = class ExportService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async exportAttendanceCSV(eventId) {
        const db = this.firebaseService.firestore;
        let query = db.collection('attendance').orderBy('attendedAt', 'desc');
        if (eventId)
            query = query.where('eventId', '==', eventId);
        const snap = await query.limit(1000).get();
        const header = 'userId,eventId,status,attendedAt\n';
        const rows = snap.docs.map(d => {
            const data = d.data();
            return `${data.userId},${data.eventId},${data.status},${data.attendedAt?.toDate?.()?.toISOString() || ''}`;
        }).join('\n');
        return header + rows;
    }
    async exportMembersCSV() {
        const db = this.firebaseService.firestore;
        const snap = await db.collection('members').orderBy('name', 'asc').get();
        const header = 'memberId,name,division,pillar,generation,status\n';
        const rows = snap.docs.map(d => {
            const data = d.data();
            return `${data.memberId || ''},${data.name || ''},${data.division || ''},${data.pillar || ''},${data.generation || ''},${data.status || ''}`;
        }).join('\n');
        return header + rows;
    }
    async exportUsersCSV() {
        const db = this.firebaseService.firestore;
        const snap = await db.collection('users').orderBy('displayName', 'asc').get();
        const header = 'uid,displayName,email,role,xp,attendanceCount,streak\n';
        const rows = snap.docs.map(d => {
            const data = d.data();
            return `${d.id},${data.displayName || ''},${data.email || ''},${data.role || ''},${data.xpCache || 0},${data.attendanceCount || 0},${data.streak || 0}`;
        }).join('\n');
        return header + rows;
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], ExportService);
//# sourceMappingURL=export.service.js.map