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
exports.UserHistoryController = void 0;
const common_1 = require("@nestjs/common");
const user_history_service_1 = require("./user-history.service");
const firebase_auth_guard_1 = require("../../common/guards/firebase-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let UserHistoryController = class UserHistoryController {
    constructor(svc) {
        this.svc = svc;
    }
    recent(limit) {
        return this.svc.getRecent(parseInt(limit || '50'));
    }
    byUser(uid, limit) {
        return this.svc.getByUser(uid, parseInt(limit || '20'));
    }
};
exports.UserHistoryController = UserHistoryController;
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserHistoryController.prototype, "recent", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserHistoryController.prototype, "byUser", null);
exports.UserHistoryController = UserHistoryController = __decorate([
    (0, common_1.Controller)('user-history'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __metadata("design:paramtypes", [user_history_service_1.UserHistoryService])
], UserHistoryController);
//# sourceMappingURL=user-history.controller.js.map