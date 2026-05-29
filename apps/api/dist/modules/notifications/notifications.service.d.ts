export declare class NotificationsService {
    private readonly logger;
    sendNotification(userId: string, title: string, body: string): Promise<{
        success: boolean;
        note: string;
    }>;
    sendBroadcast(title: string, body: string): Promise<{
        success: boolean;
        note: string;
    }>;
    sendEventReminder(eventId: string): Promise<{
        success: boolean;
        note: string;
    }>;
}
