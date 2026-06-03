import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private service;
    constructor(service: NotificationsService);
    send(body: {
        userId: string;
        title: string;
        body: string;
    }): Promise<{
        success: boolean;
        note: string;
    }>;
    broadcast(body: {
        title: string;
        body: string;
    }): Promise<{
        success: boolean;
        note: string;
    }>;
    reminder(body: {
        eventId: string;
    }): Promise<{
        success: boolean;
        note: string;
    }>;
}
