import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract current user from request (set by BetterAuthGuard).
 * Usage: @CurrentUser() user: any  |  @CurrentUser('role') role: string
 */
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
