"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHistoryModule = void 0;
const common_1 = require("@nestjs/common");
const user_history_service_1 = require("./user-history.service");
const user_history_controller_1 = require("./user-history.controller");
const firebase_module_1 = require("../../firebase/firebase.module");
let UserHistoryModule = class UserHistoryModule {
};
exports.UserHistoryModule = UserHistoryModule;
exports.UserHistoryModule = UserHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_module_1.FirebaseModule],
        providers: [user_history_service_1.UserHistoryService],
        controllers: [user_history_controller_1.UserHistoryController],
        exports: [user_history_service_1.UserHistoryService],
    })
], UserHistoryModule);
//# sourceMappingURL=user-history.module.js.map