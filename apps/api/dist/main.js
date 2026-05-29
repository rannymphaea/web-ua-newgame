"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const rateLimitMap = new Map();
function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
        return next();
    }
    entry.count++;
    if (entry.count > 100) {
        res.status(429).json({ statusCode: 429, message: 'Too many requests. Try again later.' });
        return;
    }
    next();
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.use(rateLimiter);
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`NEWGAME API running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map