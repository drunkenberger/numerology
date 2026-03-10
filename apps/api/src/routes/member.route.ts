// ─────────────────────────────────────────────────────────────────────────────
// ROUTE — /members
// CRUD de integrantes familiares (usa service_role_key → bypasa RLS).
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../utils/supabase';
import type { AuthenticatedRequest } from '../types';

export const memberRouter = Router();

// ── Validación ──────────────────────────────────────────────────────────────

const CreateMemberSchema = z.object({
  firstName:       z.string().min(1, 'Nombre requerido'),
  paternalSurname: z.string().min(1, 'Apellido paterno requerido'),
  maternalSurname: z.string().default(''),
  birthDay:        z.number().int().min(1).max(31),
  birthMonth:      z.number().int().min(1).max(12),
  birthYear:       z.number().int().min(1900).max(2100),
  relation:        z.string().min(1),
  numbers:         z.any().optional(),
});

// ── GET /members ────────────────────────────────────────────────────────────

memberRouter.get(
  '/',
  requireAuth as any,
  async (req: any, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', authReq.userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[list-members]', error.message);
      res.status(500).json({ error: 'db_error', message: error.message });
      return;
    }

    res.json(data ?? []);
  }
);

// ── POST /members ───────────────────────────────────────────────────────────

memberRouter.post(
  '/',
  requireAuth as any,
  async (req: any, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const parsed = CreateMemberSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'validation_error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const input = parsed.data;

    const { data, error } = await supabase
      .from('family_members')
      .insert({
        user_id:          authReq.userId,
        first_name:       input.firstName,
        paternal_surname: input.paternalSurname,
        maternal_surname: input.maternalSurname,
        birth_day:        input.birthDay,
        birth_month:      input.birthMonth,
        birth_year:       input.birthYear,
        relation:         input.relation,
        numbers:          input.numbers ?? null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[create-member]', error.message);
      res.status(500).json({ error: 'db_error', message: error.message });
      return;
    }

    res.status(201).json(data);
  }
);

// ── DELETE /members/:id ─────────────────────────────────────────────────────

memberRouter.delete(
  '/:id',
  requireAuth as any,
  async (req: any, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id)
      .eq('user_id', authReq.userId);

    if (error) {
      console.error('[delete-member]', error.message);
      res.status(500).json({ error: 'db_error', message: error.message });
      return;
    }

    res.status(200).json({ ok: true });
  }
);
