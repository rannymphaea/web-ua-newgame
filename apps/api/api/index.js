'use strict';

// Handler ini memuat NestJS yang sudah dikompilasi dari folder dist/
// reflect-metadata HARUS dimuat pertama sebelum modul lain
require('reflect-metadata');

const { NestFactory }      = require('@nestjs/core');
const { ExpressAdapter }   = require('@nestjs/platform-express');
const express              = require('express');

let cachedApp;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const { AppModule } = require('../dist/app.module');

  const expressServer = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressServer),
    { logger: ['error', 'warn'] },
  );

  app.enableCors({ origin: '*', credentials: true });
  app.setGlobalPrefix('api');

  await app.init();
  cachedApp = expressServer;
  return cachedApp;
}

module.exports = async (req, res) => {
  // Redirect root path ke frontend landing page
  if (req.url === '/' || req.url === '') {
    const frontendUrl = process.env.WEB_URL || 'https://unandnewgame-tan.vercel.app';
    res.redirect(301, `${frontendUrl}/landing`);
    return;
  }

  try {
    const server = await bootstrap();
    server(req, res);
  } catch (err) {
    console.error('Bootstrap error:', err);
    res.status(500).json({ error: 'Server failed to start', detail: err.message });
  }
};
