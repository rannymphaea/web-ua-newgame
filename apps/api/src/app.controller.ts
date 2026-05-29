import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  /** GET / — Redirect ke frontend landing page */
  @Get()
  @Redirect()
  redirectToLanding() {
    const frontendUrl = process.env.WEB_URL || 'https://unandnewgame-tan.vercel.app';
    return { url: `${frontendUrl}/landing`, statusCode: 301 };
  }

  /** GET /health — Alias health check */
  @Get('health')
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
