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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XpController = void 0;
const common_1 = require("@nestjs/common");
const xp_service_1 = require("./xp.service");
const firebase_auth_guard_1 = require("../../common/guards/firebase-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let XpController = class XpController {
    constructor(xpService) {
        this.xpService = xpService;
    }
    async editXP(user, body) {
        return this.xpService.editXPManual(body.targetUserId, body.newXP, body.reason, user.uid, user.role);
    }
    async getHistory(userId, limit) {
        return this.xpService.getXPHistory(userId, parseInt(limit) || 30);
    }
};
exports.XpController = XpController;
__decorate([
    (0, common_1.Post)('edit'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('inventori'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], XpController.prototype, "editXP", null);
__decorate([
    (0, common_1.Get)('history/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], XpController.prototype, "getHistory", null);
exports.XpController = XpController = __decorate([
    (0, common_1.Controller)('xp'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:paramtypes", [xp_service_1.XpService])
], XpController);
//# sourceMappingURL=xp.controller.js.map