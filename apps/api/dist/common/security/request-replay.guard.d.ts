import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class RequestReplayGuard implements CanActivate {
    private readonly nonceStore;
    private readonly bodyStore;
    private readonly WINDOW_SECONDS;
    canActivate(context: ExecutionContext): boolean;
    private cleanupNonces;
    private logReplay;
}
