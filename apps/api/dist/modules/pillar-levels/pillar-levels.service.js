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
exports.PillarLevelsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
const pillar_definitions_1 = require("./pillar-definitions");
let PillarLevelsService = class PillarLevelsService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    getDefinitions() {
        return { pillars: pillar_definitions_1.PILLARS, levels: pillar_definitions_1.PILLAR_LEVELS };
    }
    async getUserPillarLevel(userId) {
        const db = this.firebaseService.firestore;
        const snap = await db.collection('user_pillar_levels').where('userId', '==', userId).get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async assignLevel(userId, pillarId, level, assignedBy) {
        const db = this.firebaseService.firestore;
        const existing = await db.collection('user_pillar_levels')
            .where('userId', '==', userId)
            .where('pillarId', '==', pillarId)
            .get();
        if (!existing.empty) {
            await existing.docs[0].ref.update({ level, updatedAt: this.firebaseService.timestamp, assignedBy });
        }
        else {
            await db.collection('user_pillar_levels').add({
                userId, pillarId, level, assignedBy,
                assignedAt: this.firebaseService.timestamp,
                updatedAt: this.firebaseService.timestamp,
            });
        }
        return { success: true };
    }
    async getAllMemberLevels() {
        const db = this.firebaseService.firestore;
        const snap = await db.collection('user_pillar_levels').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
};
exports.PillarLevelsService = PillarLevelsService;
exports.PillarLevelsService = PillarLevelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], PillarLevelsService);
//# sourceMappingURL=pillar-levels.service.js.map