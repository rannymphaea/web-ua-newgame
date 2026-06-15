// Entry point NestJS — Security hardened v0.1.5
// CORS strict, rate limiting, security headers, ValidationPipe
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// ── Allowed origins ─────────────────────────────────────────
// Tambahkan origin baru jika diperlukan (staging, custom domain, dsb)
const ALLOWED_ORIGINS = [
  'https://unandnewgame-tan.vercel.app',
  'https://unandnewgame.vercel.app',
  // Development
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// ── In-memory rate limiter ───────────────────────────────────
// Upstash Redis menjadi rate limiter utama di production.
// Ini adalah fallback jika Redis tidak tersedia.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimiter(req: any, res: any, next: any) {
  const ip    = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  const now   = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); // window 1 menit
    return next();
  }

  entry.count++;
  if (entry.count > 100) { // maks 100 req/menit per IP
    res.status(429).json({
      statusCode: 429,
      message: 'Too many requests. Coba lagi dalam 1 menit.',
    });
    return;
  }
  next();
}

// ── Security headers middleware ──────────────────────────────
// Setara helmet() tapi tanpa tambah dependency.
function securityHeaders(_req: any, res: any, next: any) {
  // Sembunyikan informasi server
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Hardened HTTP security headers
  res.setHeader('X-Content-Type-Options',            'nosniff');
  res.setHeader('X-Frame-Options',                   'DENY');
  res.setHeader('X-XSS-Protection',                  '0'); // CSP sudah menangani ini, 1 mode=block deprecated
  res.setHeader('Referrer-Policy',                   'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Cross-Origin-Resource-Policy',      'same-origin');
  res.setHeader('Cross-Origin-Opener-Policy',        'same-origin');
  res.setHeader('Permissions-Policy',                'camera=(), microphone=(), geolocation=(), payment=()');

  // HSTS — hanya di production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

async function bootstrap() {
  const app    = await NestFactory.create(AppModule, {
    // Jangan log stack trace di production
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const logger = new Logger('Bootstrap');

  // 1. Sembunyikan header server sebelum request lain
  app.use(securityHeaders);

  // 2. Rate limiting
  app.use(rateLimiter);

  // 3. CORS strict — hanya izinkan origin yang terdaftar
  const allowedOrigins = process.env.FRONTEND_URL
    ? [...ALLOWED_ORIGINS, process.env.FRONTEND_URL]
    : ALLOWED_ORIGINS;

  app.enableCors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (server-to-server, mobile apps, Postman dev)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin tidak diizinkan oleh CORS: ${origin}`));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // preflight cache 24 jam
  });

  // 4. Global prefix
  app.setGlobalPrefix('api');

  // 5. ValidationPipe — tolak field yang tidak didefinisikan di DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip field tidak dikenal
      forbidNonWhitelisted: true, // error jika ada field tidak dikenal (hardened)
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 6. Exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 7. Response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 8. Shutdown hooks (untuk Docker graceful stop)
  app.enableShutdownHooks();

  const port = process.env.PORT || 3001;
  // Di production/Docker: listen hanya localhost (reverse proxy yang expose ke luar)
  const host = process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0';
  await app.listen(port, host);
  logger.log(`NEWGAME API berjalan di http://${host}:${port}/api`);
}

bootstrap();
