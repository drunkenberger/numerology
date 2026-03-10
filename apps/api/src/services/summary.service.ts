// ─────────────────────────────────────────────────────────────────────────────
// SERVICE — Summary
// Genera un resumen rápido (~10s) del mapa numerológico personal.
// Misma arquitectura que reading.service: fetch → cache → Claude → save.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../utils/supabase';
import { anthropic, CLAUDE_MODELS, TOKEN_LIMITS } from '../utils/anthropic';
import { SYSTEM_PROMPT, buildSummaryPrompt } from '../prompts/summary';
import { calculateMap } from '@jyotish/numerology';
import type {
  FamilyMemberRow,
  MemberNumbers,
  SummaryContent,
  GenerateSummaryResponse,
} from '../types';

// ── Cache key ─────────────────────────────────────────────────────────────────

function buildCacheKey(members: Array<{ numbers: MemberNumbers }>): string {
  const numStr = members
    .map(m => `${m.numbers.soul}:${m.numbers.personality}:${m.numbers.karma}:${m.numbers.destiny}:${m.numbers.mission}:${m.numbers.personalYear}`)
    .sort()
    .join('|');
  return `summary::personal::${numStr}`;
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

// ── Verificar caché ──────────────────────────────────────────────────────────

async function findCachedSummary(
  userId: string,
  cacheKey: string
): Promise<{ id: string; summary: string } | null> {
  const { data, error } = await supabase
    .from('readings')
    .select('id, summary')
    .eq('user_id', userId)
    .eq('cache_key', cacheKey)
    .not('summary', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data as { id: string; summary: string } | null;
}

// ── Llamar a Claude ─────────────────────────────────────────────────────────

async function callClaude(member: FamilyMemberRow): Promise<SummaryContent> {
  if (!member.numbers) throw new Error('Member has no calculated numbers');

  const userPrompt = buildSummaryPrompt({
    firstName:       member.first_name,
    paternalSurname: member.paternal_surname,
    maternalSurname: member.maternal_surname,
    numbers:         member.numbers,
  });

  const response = await anthropic.messages.create({
    model:      CLAUDE_MODELS.summary,
    max_tokens: TOKEN_LIMITS.summary,
    system:     SYSTEM_PROMPT,
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
  memberIds: string[];
  cacheKey: string;
  content: SummaryContent;
}): Promise<string> {
  const { userId, memberIds, cacheKey, content } = params;

  const { data, error } = await supabase
    .from('readings')
    .insert({
      user_id:      userId,
      type:         'personal',
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
  memberIds: string[];
}): Promise<GenerateSummaryResponse> {
  const { userId, memberIds } = params;

  if (memberIds.length !== 1) {
    throw new Error(`Summary requires exactly 1 member, got ${memberIds.length}`);
  }

  const members = await fetchMembers(memberIds, userId);
  const member = members[0];

  // Recalcular números con la fecha actual (año personal cambia cada año)
  member.numbers = calculateMap({
    firstName:       member.first_name,
    paternalSurname: member.paternal_surname,
    maternalSurname: member.maternal_surname,
    birthDate: {
      day:   member.birth_day,
      month: member.birth_month,
      year:  member.birth_year,
    },
  });

  const cacheKey = buildCacheKey(members as Array<FamilyMemberRow & { numbers: MemberNumbers }>);
  const cached = await findCachedSummary(userId, cacheKey);

  if (cached) {
    try {
      const content = JSON.parse(cached.summary) as SummaryContent;
      return { readingId: cached.id, content, cached: true };
    } catch {
      // Cache corrupto — regenerar
    }
  }

  const content = await callClaude(member);
  const readingId = await saveSummary({ userId, memberIds, cacheKey, content });

  return { readingId, content, cached: false };
}
