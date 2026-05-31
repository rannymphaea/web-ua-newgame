export declare class AppController {
    redirectToLanding(): {
        url: string;
        statusCode: number;
    };
    health(): {
        status: string;
        uptime: number;
        timestamp: string;
    };
}
