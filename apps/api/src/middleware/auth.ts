// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE — Auth
// Verifica el JWT de Supabase y adjunta userId + isPremium al request
// ─────────────────────────────────────────────────────────────────────────────

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types';
import { supabase } from '../utils/supabase';

// DEV: bypass auth in development using X-Dev-User header
const DEV_MODE = process.env.NODE_ENV === 'development';

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Dev bypass — trust X-Dev-User header
  if (DEV_MODE && req.headers['x-dev-user']) {
    const devUserId = req.headers['x-dev-user'] as string;
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', devUserId)
      .single();

    req.userId         = devUserId;
    req.isPremium      = profile?.is_premium ?? true;
    req.readingCredits = 99; // dev mode: unlimited credits
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  // Verificar el JWT con Supabase — esto valida firma + expiración
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Obtener estado premium del perfil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    res.status(401).json({ error: 'User profile not found' });
    return;
  }

  // reading_credits puede no existir aún (migration 004)
  let readingCredits = 0;
  try {
    const { data: creditsData } = await supabase
      .from('profiles')
      .select('reading_credits')
      .eq('id', user.id)
      .single();
    readingCredits = creditsData?.reading_credits ?? 0;
  } catch { /* column not yet created */ }

  req.userId         = user.id;
  req.isPremium      = profile.is_premium;
  req.readingCredits = readingCredits;

  next();
}

export function requirePremium(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.isPremium) {
    res.status(403).json({
      error: 'premium_required',
      message: 'Esta función requiere una suscripción premium',
    });
    return;
  }
  next();
}

export function requirePremiumOrCredits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.isPremium || req.readingCredits > 0) {
    next();
    return;
  }
  res.status(403).json({
    error: 'premium_required',
    message: 'Necesitas créditos o una suscripción para generar lecturas.',
    credits: 0,
  });
}
