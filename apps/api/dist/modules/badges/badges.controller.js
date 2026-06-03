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
exports.BadgesController = void 0;
const common_1 = require("@nestjs/common");
const badges_service_1 = require("./badges.service");
const firebase_auth_guard_1 = require("../../common/guards/firebase-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let BadgesController = class BadgesController {
    constructor(badgesService) {
        this.badgesService = badgesService;
    }
    getDefinitions() {
        return this.badgesService.getDefinitions();
    }
    async getMyBadges(user) {
        return this.badgesService.getUserBadges(user.uid);
    }
    async checkMyBadges(user) {
        return this.badgesService.checkAndAward(user.uid);
    }
    async getUserBadges(userId) {
        return this.badgesService.getUserBadges(userId);
    }
    async awardBadge(user, body) {
        return this.badgesService.awardBadge(body.userId, body.badgeId, user.uid);
    }
    async revokeBadge(body) {
        return this.badgesService.revokeBadge(body.userId, body.badgeId);
    }
};
exports.BadgesController = BadgesController;
__decorate([
    (0, common_1.Get)('definitions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BadgesController.prototype, "getDefinitions", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BadgesController.prototype, "getMyBadges", null);
__decorate([
    (0, common_1.Get)('check'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BadgesController.prototype, "checkMyBadges", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BadgesController.prototype, "getUserBadges", null);
__decorate([
    (0, common_1.Post)('award'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BadgesController.prototype, "awardBadge", null);
__decorate([
    (0, common_1.Post)('revoke'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BadgesController.prototype, "revokeBadge", null);
exports.BadgesController = BadgesController = __decorate([
    (0, common_1.Controller)('badges'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:paramtypes", [badges_service_1.BadgesService])
], BadgesController);
//# sourceMappingURL=badges.controller.js.map