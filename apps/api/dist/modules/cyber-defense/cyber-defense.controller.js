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
exports.CyberDefenseController = void 0;
const common_1 = require("@nestjs/common");
const cyber_defense_service_1 = require("./cyber-defense.service");
const firebase_auth_guard_1 = require("../../common/guards/firebase-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let CyberDefenseController = class CyberDefenseController {
    constructor(defense) {
        this.defense = defense;
    }
    monitor() {
        return this.defense.getMonitoringSnapshot();
    }
    events(limit) {
        return { events: this.defense.getRecentEvents(parseInt(limit || '50')) };
    }
    ipInfo(ip) {
        return this.defense.getIpInfo(ip);
    }
    blockIp(body) {
        this.defense.block(body.ip, body.reason || 'manual_admin_block');
        return { success: true, message: `IP ${body.ip} blocked` };
    }
    unblockIp(ip) {
        this.defense.unblock(ip);
        return { success: true, message: `IP ${ip} unblocked` };
    }
};
exports.CyberDefenseController = CyberDefenseController;
__decorate([
    (0, common_1.Get)('monitor'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CyberDefenseController.prototype, "monitor", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CyberDefenseController.prototype, "events", null);
__decorate([
    (0, common_1.Get)('ip/:ip'),
    __param(0, (0, common_1.Param)('ip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CyberDefenseController.prototype, "ipInfo", null);
__decorate([
    (0, common_1.Post)('block'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CyberDefenseController.prototype, "blockIp", null);
__decorate([
    (0, common_1.Delete)('block/:ip'),
    __param(0, (0, common_1.Param)('ip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CyberDefenseController.prototype, "unblockIp", null);
exports.CyberDefenseController = CyberDefenseController = __decorate([
    (0, common_1.Controller)('cyber-defense'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __metadata("design:paramtypes", [cyber_defense_service_1.CyberDefenseService])
], CyberDefenseController);
//# sourceMappingURL=cyber-defense.controller.js.map