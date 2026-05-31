export declare class AppController {
    redirectToLanding(): {
        url: string;
        statusCode: number;
    };
    health(): {
        status: string;
        uptime: any;
        timestamp: string;
    };
}
