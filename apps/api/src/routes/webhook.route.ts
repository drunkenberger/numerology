// ─────────────────────────────────────────────────────────────────────────────
// ROUTE — POST /webhooks/revenuecat
// Actualiza is_premium y reading_credits en Supabase según eventos de RevenueCat
// ─────────────────────────────────────────────────────────────────────────────

import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../utils/supabase';

export const webhookRouter = Router();

// ── Product IDs de RevenueCat ────────────────────────────────────────────────

const PRODUCT_CREDITS: Record<string, number> = {
  'jyotish_single_reading':  1,   // $1 — 1 lectura
  'jyotish_bundle_10':       10,  // $7 — 10 lecturas
};

// ── Tipos de eventos RevenueCat ───────────────────────────────────────────────

type RCEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'NON_RENEWING_PURCHASE'
  | 'SUBSCRIPTION_PAUSED'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE'
  | 'TRANSFER';

interface RCWebhookPayload {
  event: {
    type: RCEventType;
    app_user_id: string;
    original_app_user_id: string;
    product_id?: string;
    expiration_at_ms?: number;
    purchased_at_ms: number;
    environment: 'SANDBOX' | 'PRODUCTION';
  };
  api_version: string;
}

// ── Verificar firma del webhook ────────────────────────────────────────────────

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}

// ── Handler ───────────────────────────────────────────────────────────────────

webhookRouter.post(
  '/revenuecat',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    let rawBody: string;
    let payload: RCWebhookPayload;

    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf8');
      payload = JSON.parse(rawBody) as RCWebhookPayload;
    } else {
      rawBody = JSON.stringify(req.body);
      payload = req.body as RCWebhookPayload;
    }

    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

    if (webhookSecret) {
      const signature = req.headers['x-revenuecat-signature'] as string | undefined;
      if (!signature) {
        res.status(401).json({ error: 'Missing signature' });
        return;
      }
      if (!verifySignature(rawBody, signature, webhookSecret)) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    }

    const { type, app_user_id, product_id } = payload.event;

    console.log(`[revenuecat-webhook] Event: ${type} · User: ${app_user_id} · Product: ${product_id ?? 'n/a'}`);

    // Ignorar eventos de sandbox en producción
    if (
      process.env.NODE_ENV === 'production' &&
      payload.event.environment === 'SANDBOX'
    ) {
      res.status(200).json({ ok: true, skipped: 'sandbox_in_production' });
      return;
    }

    try {
      switch (type) {
        // ── Suscripción activa → premium ilimitado
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'UNCANCELLATION': {
          // Verificar si es suscripción o compra única
          const credits = product_id ? PRODUCT_CREDITS[product_id] : undefined;
          if (credits !== undefined) {
            // Compra de créditos (consumable)
            await addCredits(app_user_id, credits);
            console.log(`[revenuecat-webhook] ✅ +${credits} créditos para ${app_user_id}`);
          } else {
            // Suscripción
            await supabase
              .from('profiles')
              .update({ is_premium: true })
              .eq('id', app_user_id);
            console.log(`[revenuecat-webhook] ✅ Premium activado para ${app_user_id}`);
          }
          break;
        }

        // ── Compra no renovable (créditos individuales o bundle)
        case 'NON_RENEWING_PURCHASE': {
          const credits = product_id ? PRODUCT_CREDITS[product_id] : 1;
          await addCredits(app_user_id, credits ?? 1);
          console.log(`[revenuecat-webhook] ✅ +${credits} créditos para ${app_user_id}`);
          break;
        }

        // ── Suscripción expirada → revocar premium
        case 'EXPIRATION': {
          await supabase
            .from('profiles')
            .update({ is_premium: false })
            .eq('id', app_user_id);
          console.log(`[revenuecat-webhook] ❌ Premium expirado para ${app_user_id}`);
          break;
        }

        // ── Cancelación — mantiene acceso hasta expiración
        case 'CANCELLATION': {
          console.log(`[revenuecat-webhook] ⚠️ Cancelación registrada para ${app_user_id}`);
          break;
        }

        case 'BILLING_ISSUE': {
          console.warn(`[revenuecat-webhook] ⚠️ Billing issue para ${app_user_id}`);
          break;
        }

        default:
          console.log(`[revenuecat-webhook] Evento no manejado: ${type}`);
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[revenuecat-webhook] Error:', err);
      res.status(200).json({ ok: false, error: 'internal_error' });
    }
  }
);

// ── Helper: agregar créditos de lectura ─────────────────────────────────────

async function addCredits(userId: string, amount: number): Promise<void> {
  // Usa RPC atómico para evitar race conditions
  const { error } = await supabase.rpc('add_reading_credits', {
    user_id_input: userId,
    amount_input: amount,
  });

  if (error) {
    // Fallback: operación directa (menos segura pero funcional)
    console.warn('[addCredits] RPC failed, using fallback:', error.message);
    const { data } = await supabase
      .from('profiles')
      .select('reading_credits')
      .eq('id', userId)
      .single();
    const current = data?.reading_credits ?? 0;
    await supabase
      .from('profiles')
      .update({ reading_credits: current + amount })
      .eq('id', userId);
  }
}
