// ─────────────────────────────────────────────────────────────────────────────
// ROUTE — POST /generate-reading
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requirePremium } from '../middleware/auth';
import { readingLimiter } from '../middleware/rate-limit';
import { generateReading } from '../services/reading.service';
import { generateSummary } from '../services/summary.service';
import { supabase } from '../utils/supabase';
import type { AuthenticatedRequest, GenerateReadingResponse, GenerateSummaryResponse, ReadingListItem } from '../types';

export const readingRouter = Router();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Validación Zod ─────────────────────────────────────────────────────────────

const GenerateReadingSchema = z.object({
  type: z.enum(['personal', 'compatibility', 'family'], {
    errorMap: () => ({ message: "type debe ser 'personal', 'compatibility' o 'family'" }),
  }),
  interpretation: z.enum(['hindu', 'pythagorean'], {
    errorMap: () => ({ message: "interpretation debe ser 'hindu' o 'pythagorean'" }),
  }),
  memberIds: z
    .array(z.string().uuid({ message: 'Cada memberId debe ser un UUID válido' }))
    .min(1, 'Se requiere al menos 1 memberId')
    .max(10, 'Máximo 10 miembros por lectura'),
});

// ── POST /generate-reading ────────────────────────────────────────────────────

readingRouter.post(
  '/',
  requireAuth as any,
  readingLimiter as any,
  // requirePremium as any, // TODO: re-enable for production
  async (req: any, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    // Validar body
    const parsed = GenerateReadingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'validation_error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { type, interpretation, memberIds } = parsed.data;

    try {
      const result: GenerateReadingResponse = await generateReading({
        userId: authReq.userId,
        type,
        interpretation,
        memberIds,
      });

      res.status(200).json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      // Errores de validación de negocio (400)
      if (
        message.includes('requires exactly') ||
        message.includes('requires at least') ||
        message.includes('without calculated numbers') ||
        message.includes('not found') ||
        message.includes('No members found')
      ) {
        res.status(400).json({ error: 'business_error', message });
        return;
      }

      // Error de Claude API (503)
      if (message.includes('Claude') || message.includes('JSON')) {
        console.error('[generate-reading] Claude API error:', message);
        res.status(503).json({
          error:   'ai_unavailable',
          message: 'El servicio de interpretación no está disponible temporalmente. Inténtalo de nuevo.',
        });
        return;
      }

      // Error genérico (500)
      console.error('[generate-reading] Unexpected error:', err);
      res.status(500).json({ error: 'internal_error', message: 'Error interno del servidor' });
    }
  }
);

// ── POST /generate-reading/summary ───────────────────────────────────────────

const GenerateSummarySchema = z.object({
  type: z.literal('personal', {
    errorMap: () => ({ message: "Summary solo soporta type 'personal'" }),
  }),
  interpretation: z.enum(['hindu', 'pythagorean'], {
    errorMap: () => ({ message: "interpretation debe ser 'hindu' o 'pythagorean'" }),
  }),
  memberIds: z
    .array(z.string().uuid({ message: 'Cada memberId debe ser un UUID válido' }))
    .length(1, 'Summary requiere exactamente 1 memberId'),
});

readingRouter.post(
  '/summary',
  requireAuth as any,
  readingLimiter as any,
  async (req: any, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const parsed = GenerateSummarySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'validation_error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { interpretation, memberIds } = parsed.data;

    try {
      const result: GenerateSummaryResponse = await generateSummary({
        userId: authReq.userId,
        interpretation,
        memberIds,
      });

      res.status(200).json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      if (
        message.includes('requires exactly') ||
        message.includes('without calculated numbers') ||
        message.includes('not found') ||
        message.includes('no calculated numbers') ||
        message.includes('No members found')
      ) {
        res.status(400).json({ error: 'business_error', message });
        return;
      }

      if (message.includes('Claude') || message.includes('JSON')) {
        console.error('[generate-summary] Claude API error:', message);
        res.status(503).json({
          error:   'ai_unavailable',
          message: 'El servicio de interpretación no está disponible temporalmente.',
        });
        return;
      }

      console.error('[generate-summary] Unexpected error:', err);
      res.status(500).json({ error: 'internal_error', message: 'Error interno del servidor' });
    }
  }
);

// ── GET /generate-reading/list ────────────────────────────────────────────────

readingRouter.get(
  '/list',
  requireAuth as any,
  async (req: any, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const typeFilter = req.query.type as string | undefined;

    let query = supabase
      .from('readings')
      .select('id, type, interpretation, summary, members, html_export, jpg_export, created_at')
      .eq('user_id', authReq.userId)
      .not('full_content', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (typeFilter && ['personal', 'compatibility', 'family'].includes(typeFilter)) {
      query = query.eq('type', typeFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[list-readings] DB error:', error.message);
      res.status(500).json({ error: 'internal_error', message: 'Error al obtener lecturas' });
      return;
    }

    if (!data || data.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Collect unique member IDs to resolve names
    const allMemberIds = [...new Set(data.flatMap(r => r.members as string[]))];

    const { data: membersData } = await supabase
      .from('family_members')
      .select('id, first_name')
      .in('id', allMemberIds)
      .eq('user_id', authReq.userId);

    const nameMap = new Map<string, string>();
    if (membersData) {
      for (const m of membersData) {
        nameMap.set(m.id, m.first_name);
      }
    }

    const items: ReadingListItem[] = data.map(r => ({
      id:             r.id,
      type:           r.type,
      interpretation: r.interpretation ?? 'hindu',
      summary:        r.summary,
      htmlExport:     r.html_export,
      jpgExport:      r.jpg_export,
      createdAt:      r.created_at,
      memberNames:    (r.members as string[]).map(id => nameMap.get(id) ?? 'Desconocido'),
    }));

    res.status(200).json(items);
  }
);

// ── DELETE /generate-reading/:id ──────────────────────────────────────────────

readingRouter.delete(
  '/:id',
  requireAuth as any,
  async (req: any, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'validation_error', message: 'ID inválido' });
      return;
    }

    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', id)
      .eq('user_id', authReq.userId);

    if (error) {
      console.error('[delete-reading]', error.message);
      res.status(500).json({ error: 'db_error', message: 'Error al eliminar lectura' });
      return;
    }

    res.status(200).json({ ok: true });
  }
);

// ── GET /generate-reading/:id ─────────────────────────────────────────────────

readingRouter.get(
  '/:id',
  requireAuth as any,
  async (req: any, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'validation_error', message: 'ID inválido' });
      return;
    }

    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('id', id)
      .eq('user_id', authReq.userId)
      .maybeSingle();

    if (error || !data) {
      res.status(404).json({ error: 'Reading not found' });
      return;
    }

    res.status(200).json({
      id:             data.id,
      type:           data.type,
      interpretation: data.interpretation ?? 'hindu',
      members:        data.members,
      summary:        data.summary,
      fullContent:    data.full_content,
      htmlExport:     data.html_export,
      jpgExport:      data.jpg_export,
      createdAt:      data.created_at,
    });
  }
);
