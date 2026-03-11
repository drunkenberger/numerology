// ─────────────────────────────────────────────────────────────────────────────
// SERVICE — Summary
// Genera un resumen rápido (~10s) del mapa numerológico personal.
// Misma arquitectura que reading.service: fetch → cache → Claude → save.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../utils/supabase';
import { anthropic, CLAUDE_MODELS, TOKEN_LIMITS } from '../utils/anthropic';
import { getSystemPrompt, buildSummaryPromptForInterpretation } from '../prompts/summary';
import { calculateMap } from '@jyotish/numerology';
import type { CalculationSystem } from '@jyotish/numerology';
import type {
  Interpretation,
  FamilyMemberRow,
  MemberNumbers,
  SummaryContent,
  GenerateSummaryResponse,
} from '../types';

/** Map interpretation framework → calculation table */
function toCalcSystem(interpretation: Interpretation): CalculationSystem {
  return interpretation === 'hindu' ? 'chaldean' : 'pythagorean';
}

// ── Cache key ─────────────────────────────────────────────────────────────────

function buildCacheKey(interpretation: Interpretation, members: Array<{ numbers: MemberNumbers }>): string {
  const numStr = members
    .map(m => `${m.numbers.soul}:${m.numbers.personality}:${m.numbers.karma}:${m.numbers.destiny}:${m.numbers.mission}:${m.numbers.personalYear}`)
    .sort()
    .join('|');
  return `summary::${interpretation}::personal::${numStr}`;
}

// ── Fetch miembros ────────────────────────────────────────────────────────────

async function fetchMembers(
  memberIds: string[],
  userId: string
): Promise<FamilyMemberRow[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .in('id', memberIds)
    .eq('user_id', userId);

  if (error) throw new Error(`Error fetching family members: ${error.message}`);
  if (!data || data.length === 0) throw new Error('No members found for given IDs');
  if (data.length !== memberIds.length) {
    throw new Error('Some member IDs were not found or do not belong to this user');
  }

  return data as FamilyMemberRow[];
}

// ── Llamar a Claude ─────────────────────────────────────────────────────────

async function callClaude(member: FamilyMemberRow, interpretation: Interpretation): Promise<SummaryContent> {
  if (!member.numbers) throw new Error('Member has no calculated numbers');

  const promptInput = {
    firstName:       member.first_name,
    paternalSurname: member.paternal_surname,
    maternalSurname: member.maternal_surname,
    numbers:         member.numbers,
  };
  const userPrompt = buildSummaryPromptForInterpretation(interpretation, promptInput);

  const response = await anthropic.messages.create({
    model:      CLAUDE_MODELS.summary,
    max_tokens: TOKEN_LIMITS.summary,
    system:     getSystemPrompt(interpretation),
    messages:   [{ role: 'user', content: userPrompt }],
  });

  const rawText = response.content
    .filter(block => block.type === 'text')
    .map(block => (block as { type: 'text'; text: string }).text)
    .join('');

  if (response.stop_reason === 'max_tokens') {
    console.error(`[callClaude:summary] Response truncated (${response.usage?.output_tokens} tokens)`);
    throw new Error('Claude response was truncated — increase token limit');
  }

  const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[callClaude:summary] No JSON found:', rawText.substring(0, 500));
    throw new Error('Claude response did not contain valid JSON');
  }

  try {
    return JSON.parse(jsonMatch[0]) as SummaryContent;
  } catch {
    console.error('[callClaude:summary] JSON parse failed:', jsonMatch[0].substring(0, 500));
    throw new Error('Failed to parse Claude response as JSON');
  }
}

// ── Guardar en Supabase ─────────────────────────────────────────────────────

async function saveSummary(params: {
  userId: string;
  interpretation: Interpretation;
  memberIds: string[];
  cacheKey: string;
  content: SummaryContent;
}): Promise<string> {
  const { userId, interpretation, memberIds, cacheKey, content } = params;

  const { data, error } = await supabase
    .from('readings')
    .insert({
      user_id:      userId,
      type:         'personal',
      interpretation,
      members:      memberIds,
      cache_key:    cacheKey,
      summary:      JSON.stringify(content),
      full_content: null,
      html_export:  null,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Error saving summary: ${error.message}`);
  return data.id as string;
}

// ── Función principal ────────────────────────────────────────────────────────

export async function generateSummary(params: {
  userId: string;
  interpretation: Interpretation;
  memberIds: string[];
}): Promise<GenerateSummaryResponse> {
  const { userId, interpretation, memberIds } = params;

  if (memberIds.length !== 1) {
    throw new Error(`Summary requires exactly 1 member, got ${memberIds.length}`);
  }

  const members = await fetchMembers(memberIds, userId);
  const member = members[0];

  // Recalcular números con la fecha actual y la tabla correcta
  const system = toCalcSystem(interpretation);
  member.numbers = calculateMap({
    firstName:       member.first_name,
    paternalSurname: member.paternal_surname,
    maternalSurname: member.maternal_surname,
    birthDate: {
      day:   member.birth_day,
      month: member.birth_month,
      year:  member.birth_year,
    },
  }, new Date(), system);

  const cacheKey = buildCacheKey(interpretation, members as Array<FamilyMemberRow & { numbers: MemberNumbers }>);

  // Siempre generar lectura fresca — no usar caché
  const content = await callClaude(member, interpretation);
  const readingId = await saveSummary({ userId, interpretation, memberIds, cacheKey, content });

  return { readingId, content, cached: false };
}
