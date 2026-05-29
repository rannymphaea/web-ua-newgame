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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const media_service_1 = require("./media.service");
const firebase_auth_guard_1 = require("../../common/guards/firebase-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
let MediaController = class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async upload(user, body) {
        return this.mediaService.upload(user.uid, body);
    }
    async uploadProfile(user, file) {
        if (!file)
            throw new common_1.BadRequestException('File wajib diupload');
        return this.mediaService.uploadProfile(user.uid, file, 'avatar');
    }
    getAvatarList() {
        return this.mediaService.getAvatarList();
    }
    async selectAvatar(user, avatar) {
        if (!avatar)
            throw new common_1.BadRequestException('Field "avatar" wajib diisi');
        return this.mediaService.selectAvatar(user.uid, avatar);
    }
    async getAll(usage, mimeType, limit) {
        return this.mediaService.getAll({
            usage,
            mimeType,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    async updateMeta(id, body) {
        return this.mediaService.updateMeta(id, body);
    }
    async delete(id) {
        return this.mediaService.delete(id);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('upload-profile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!ALLOWED_MIME.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException(`Tipe file tidak diizinkan: ${file.mimetype}`), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadProfile", null);
__decorate([
    (0, common_1.Get)('avatar'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getAvatarList", null);
__decorate([
    (0, common_1.Post)('avatar/select'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('avatar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "selectAvatar", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Query)('usage')),
    __param(1, (0, common_1.Query)('mimeType')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "updateMeta", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "delete", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map