// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT — apps/api
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { readingRouter } from './routes/reading.route';
import { memberRouter }  from './routes/member.route';
import { webhookRouter } from './routes/webhook.route';
// readingLimiter se importa desde middleware/rate-limit.ts directamente en reading.route.ts

const app  = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);

// ── Seguridad ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://jyotish.app', 'https://www.jyotish.app']  // TODO: ajustar dominio real
    : '*',
  methods: ['GET', 'POST', 'DELETE'],
}));

// ── Body parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));

// ── Rate limiting global ───────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV });
});

// ── Rutas ──────────────────────────────────────────────────────────────────────
app.use('/generate-reading', readingRouter);
app.use('/members', memberRouter);
app.use('/webhooks', webhookRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler global ───────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[uncaught]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`Jyotish API running on port ${PORT} [${process.env.NODE_ENV}]`);
});
server.timeout = 150_000;        // 2.5 min — family readings use 2 sequential calls
server.keepAliveTimeout = 65_000; // keep-alive para conexiones lentas

export default app;
