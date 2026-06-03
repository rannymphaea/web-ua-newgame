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
exports.AnomaliesController = void 0;
const common_1 = require("@nestjs/common");
const anomalies_service_1 = require("./anomalies.service");
const firebase_auth_guard_1 = require("../../common/guards/firebase-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AnomaliesController = class AnomaliesController {
    constructor(anomaliesService) {
        this.anomaliesService = anomaliesService;
    }
    async getAnomalies(type, resolved, limit) {
        return this.anomaliesService.getAnomalies({
            type,
            resolved: resolved !== undefined ? resolved === 'true' : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }
    async resolveAnomaly(id, user, body) {
        return this.anomaliesService.resolveAnomaly(id, user.uid, body.note);
    }
};
exports.AnomaliesController = AnomaliesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('resolved')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnomaliesController.prototype, "getAnomalies", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AnomaliesController.prototype, "resolveAnomaly", null);
exports.AnomaliesController = AnomaliesController = __decorate([
    (0, common_1.Controller)('anomalies'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [anomalies_service_1.AnomaliesService])
], AnomaliesController);
//# sourceMappingURL=anomalies.controller.js.map