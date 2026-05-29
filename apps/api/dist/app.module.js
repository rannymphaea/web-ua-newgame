"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const firebase_module_1 = require("./firebase/firebase.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const members_module_1 = require("./modules/members/members.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const xp_module_1 = require("./modules/xp/xp.module");
const badges_module_1 = require("./modules/badges/badges.module");
const events_module_1 = require("./modules/events/events.module");
const news_module_1 = require("./modules/news/news.module");
const leave_module_1 = require("./modules/leave/leave.module");
const media_module_1 = require("./modules/media/media.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const logs_module_1 = require("./modules/logs/logs.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const anomalies_module_1 = require("./modules/anomalies/anomalies.module");
const cyber_defense_module_1 = require("./modules/cyber-defense/cyber-defense.module");
const export_module_1 = require("./modules/export/export.module");
const import_module_1 = require("./modules/import/import.module");
const pillar_levels_module_1 = require("./modules/pillar-levels/pillar-levels.module");
const user_history_module_1 = require("./modules/user-history/user-history.module");
const user_vault_module_1 = require("./modules/user-vault/user-vault.module");
const ai_module_1 = require("./modules/ai/ai.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            firebase_module_1.FirebaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            members_module_1.MembersModule,
            attendance_module_1.AttendanceModule,
            xp_module_1.XpModule,
            badges_module_1.BadgesModule,
            events_module_1.EventsModule,
            news_module_1.NewsModule,
            leave_module_1.LeaveModule,
            media_module_1.MediaModule,
            notifications_module_1.NotificationsModule,
            logs_module_1.LogsModule,
            dashboard_module_1.DashboardModule,
            anomalies_module_1.AnomaliesModule,
            cyber_defense_module_1.CyberDefenseModule,
            export_module_1.ExportModule,
            import_module_1.ImportModule,
            pillar_levels_module_1.PillarLevelsModule,
            user_history_module_1.UserHistoryModule,
            user_vault_module_1.UserVaultModule,
            ai_module_1.AiModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map