"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor() {
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendNotification(userId, title, body) {
        this.logger.log(`[PLACEHOLDER] Notification to ${userId}: ${title}`);
        return { success: true, note: 'Notification service belum dikonfigurasi' };
    }
    async sendBroadcast(title, body) {
        this.logger.log(`[PLACEHOLDER] Broadcast: ${title}`);
        return { success: true, note: 'Broadcast belum dikonfigurasi' };
    }
    async sendEventReminder(eventId) {
        this.logger.log(`[PLACEHOLDER] Event reminder: ${eventId}`);
        return { success: true, note: 'Reminder belum dikonfigurasi' };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map