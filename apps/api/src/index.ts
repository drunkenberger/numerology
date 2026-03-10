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

// ── Rate limiting específico para lecturas (caro por Claude API) ───────────────
const readingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 200, // generoso en desarrollo
  keyGenerator: (req) => {
    const authReq = req as express.Request & { userId?: string };
    return authReq.userId ?? req.ip ?? 'unknown';
  },
  message: { error: 'Límite de lecturas alcanzado. Inténtalo en una hora.' },
});

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV });
});

// ── Rutas ──────────────────────────────────────────────────────────────────────
app.use('/generate-reading', readingLimiter, readingRouter);
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
