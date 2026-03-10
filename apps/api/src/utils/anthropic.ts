// ─────────────────────────────────────────────────────────────────────────────
// ANTHROPIC CLIENT
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY env var');
}

export const anthropic = new Anthropic({
  apiKey:  process.env.ANTHROPIC_API_KEY,
  timeout: 120_000, // 2 min — suficiente para Haiku
});

// Haiku para todas las lecturas — rápido y económico
export const CLAUDE_MODELS = {
  personal:      'claude-haiku-4-5-20251001',
  compatibility: 'claude-haiku-4-5-20251001',
  family:        'claude-haiku-4-5-20251001',
  familyRoles:   'claude-haiku-4-5-20251001',
  summary:       'claude-haiku-4-5-20251001',
} as const;

export const TOKEN_LIMITS = {
  personal:      6000,
  compatibility: 8000,
  family:        10000,
  familyRoles:   4000,
  summary:       800,
} as const;
