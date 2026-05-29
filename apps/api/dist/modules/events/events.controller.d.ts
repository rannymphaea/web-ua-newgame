import { EventsService } from './events.service';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    createEvent(user: any, body: {
        name: string;
        description?: string;
        xpReward?: number;
        xpPenalty?: number;
    }): Promise<{
        success: boolean;
        eventId: string;
    }>;
    getEvents(status?: string, limit?: string): Promise<any>;
    generateToken(eventId: string, user: any): Promise<{
        success: boolean;
        tokenId: string;
        expiresAt: number;
    }>;
    closeEvent(eventId: string, user: any, body: {
        approverId?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
