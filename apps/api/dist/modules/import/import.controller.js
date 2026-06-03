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
exports.ImportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const import_service_1 = require("./import.service");
const firebase_auth_guard_1 = require("../../common/guards/firebase-auth.guard");
const superadmin_guard_1 = require("../../common/guards/superadmin.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ImportController = class ImportController {
    constructor(svc) {
        this.svc = svc;
    }
    async importCsv(file, dryRun, user) {
        if (!file)
            return { ok: false, error: 'No file uploaded' };
        if (file.size > 5 * 1024 * 1024)
            return { ok: false, error: 'File too large (max 5MB)' };
        const rows = this.svc.parseCSV(file.buffer);
        return this.svc.importRows(rows, user.uid, dryRun === 'true');
    }
    lastSummary() { return this.svc.getLastImportSummary(); }
};
exports.ImportController = ImportController;
__decorate([
    (0, common_1.Post)('csv'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('dryRun')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "importCsv", null);
__decorate([
    (0, common_1.Get)('last-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "lastSummary", null);
exports.ImportController = ImportController = __decorate([
    (0, common_1.Controller)('import'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, superadmin_guard_1.SuperadminGuard),
    __metadata("design:paramtypes", [import_service_1.ImportService])
], ImportController);
//# sourceMappingURL=import.controller.js.map