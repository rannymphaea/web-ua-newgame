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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
const import_service_1 = require("../import/import.service");
const user_history_service_1 = require("../user-history/user-history.service");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(firebase, importSvc, historySvc) {
        this.firebase = firebase;
        this.importSvc = importSvc;
        this.historySvc = historySvc;
        this.logger = new common_1.Logger(DashboardService_1.name);
    }
    async getStats() {
        try {
            const db = this.firebase.firestore;
            const [totalSnap, activeSnap, recentChanges, lastImport] = await Promise.all([
                db.collection('users').count().get(),
                db.collection('users').where('status', '==', 'active').count().get(),
                this.historySvc.getRecent(10),
                this.importSvc.getLastImportSummary(),
            ]);
            return {
                ok: true,
                totalUsers: totalSnap.data().count,
                totalMembers: activeSnap.data().count,
                recentChanges,
                lastImportSummary: lastImport,
            };
        }
        catch (err) {
            this.logger.error('Dashboard stats failed', err);
            return { ok: false, error: String(err) };
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        import_service_1.ImportService,
        user_history_service_1.UserHistoryService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map