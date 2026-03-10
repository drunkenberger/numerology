// ─────────────────────────────────────────────────────────────────────────────
// ROUTE — POST /webhooks/revenuecat
// Actualiza is_premium en Supabase según los eventos de RevenueCat
// ─────────────────────────────────────────────────────────────────────────────

import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../utils/supabase';

export const webhookRouter = Router();

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
    app_user_id: string;           // Supabase user ID que pasamos a RC
    original_app_user_id: string;
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
    // Parse body: puede llegar como Buffer (raw) o como objeto (json middleware)
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

    // Verificar firma si el secret está configurado
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
    const { type, app_user_id } = payload.event;

    console.log(`[revenuecat-webhook] Event: ${type} · User: ${app_user_id}`);

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
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'UNCANCELLATION':
        case 'NON_RENEWING_PURCHASE': {
          // Activar premium
          await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', app_user_id);
          console.log(`[revenuecat-webhook] ✅ Premium activado para ${app_user_id}`);
          break;
        }

        case 'EXPIRATION': {
          // Revocar premium al expirar
          await supabase
            .from('profiles')
            .update({ is_premium: false })
            .eq('id', app_user_id);
          console.log(`[revenuecat-webhook] ❌ Premium expirado para ${app_user_id}`);
          break;
        }

        case 'CANCELLATION': {
          // NO revocar aún — el usuario mantiene acceso hasta la fecha de expiración
          // RevenueCat enviará EXPIRATION cuando realmente termine el período
          console.log(`[revenuecat-webhook] ⚠️ Cancelación registrada para ${app_user_id} (acceso hasta expiración)`);
          break;
        }

        case 'BILLING_ISSUE': {
          // Registrar pero no revocar — RC reintentará el cobro
          console.warn(`[revenuecat-webhook] ⚠️ Billing issue para ${app_user_id}`);
          // TODO: enviar notificación push al usuario para que actualice su método de pago
          break;
        }

        default:
          console.log(`[revenuecat-webhook] Evento no manejado: ${type}`);
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[revenuecat-webhook] Error:', err);
      // Devolver 200 de todas formas para que RC no reintente indefinidamente
      res.status(200).json({ ok: false, error: 'internal_error' });
    }
  }
);
