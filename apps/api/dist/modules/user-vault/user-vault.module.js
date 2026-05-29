"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserVaultModule = void 0;
const common_1 = require("@nestjs/common");
const user_vault_service_1 = require("./user-vault.service");
const user_vault_controller_1 = require("./user-vault.controller");
const firebase_module_1 = require("../../firebase/firebase.module");
let UserVaultModule = class UserVaultModule {
};
exports.UserVaultModule = UserVaultModule;
exports.UserVaultModule = UserVaultModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_module_1.FirebaseModule],
        providers: [user_vault_service_1.UserVaultService],
        controllers: [user_vault_controller_1.UserVaultController],
        exports: [user_vault_service_1.UserVaultService],
    })
], UserVaultModule);
//# sourceMappingURL=user-vault.module.js.map