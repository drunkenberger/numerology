// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE — Rate limiting para lecturas
// Se aplica DESPUÉS de requireAuth para poder usar userId como key.
// ─────────────────────────────────────────────────────────────────────────────

import rateLimit from 'express-rate-limit';
import type express from 'express';

export const readingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 200,
  keyGenerator: (req) => {
    const authReq = req as express.Request & { userId?: string };
    return authReq.userId ?? req.ip ?? 'unknown';
  },
  message: { error: 'Límite de lecturas alcanzado. Inténtalo en una hora.' },
});
