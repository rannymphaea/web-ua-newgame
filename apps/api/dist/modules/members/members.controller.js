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
exports.MembersController = void 0;
const common_1 = require("@nestjs/common");
const members_service_1 = require("./members.service");
const firebase_auth_guard_1 = require("../../common/guards/firebase-auth.guard");
const superadmin_guard_1 = require("../../common/guards/superadmin.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const create_member_dto_1 = require("./dto/create-member.dto");
const update_member_dto_1 = require("./dto/update-member.dto");
let MembersController = class MembersController {
    constructor(svc) {
        this.svc = svc;
    }
    list(page = '1', limit = '20', search, division, role, status) {
        return this.svc.list({ page: +page, limit: +limit, search, division, role, status });
    }
    getOne(uid) { return this.svc.getOne(uid); }
    create(dto, u) { return this.svc.create(dto, u.uid); }
    import(body, u) {
        return this.svc.import(body.format, body.data, u.uid);
    }
    update(uid, dto, u) { return this.svc.update(uid, dto, u.uid); }
    remove(uid, u) { return this.svc.remove(uid, u.uid); }
};
exports.MembersController = MembersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('division')),
    __param(4, (0, common_1.Query)('role')),
    __param(5, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':uid'),
    __param(0, (0, common_1.Param)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_member_dto_1.CreateMemberDto, Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "import", null);
__decorate([
    (0, common_1.Patch)(':uid'),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_member_dto_1.UpdateMemberDto, Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':uid'),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "remove", null);
exports.MembersController = MembersController = __decorate([
    (0, common_1.Controller)('members'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, superadmin_guard_1.SuperadminGuard),
    __metadata("design:paramtypes", [members_service_1.MembersService])
], MembersController);
//# sourceMappingURL=members.controller.js.map