// ─────────────────────────────────────────────────────────────────────────────
// SERVICE — Reading
// Orquesta: fetch de miembros → cálculo de números → caché → Claude API → guardar
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../utils/supabase';
import { anthropic, CLAUDE_MODELS, TOKEN_LIMITS } from '../utils/anthropic';
import { SYSTEM_PROMPT, buildPrompt, buildSingleRolePrompt } from '../prompts/reading';
import { generateAndUploadHtml } from './html-export.service';
import { calculateMap } from '@jyotish/numerology';
import type {
  ReadingType,
  ReadingContent,
  FamilyMemberRow,
  MemberNumbers,
  GenerateReadingResponse,
} from '../types';

// ── Recalcular números con fecha actual ───────────────────────────────────

function recalculateNumbers(member: FamilyMemberRow): MemberNumbers {
  const map = calculateMap({
    firstName:       member.first_name,
    paternalSurname: member.paternal_surname,
    maternalSurname: member.maternal_surname,
    birthDate: {
      day:   member.birth_day,
      month: member.birth_month,
      year:  member.birth_year,
    },
  }); // uses new Date() by default → current personal year
  return map;
}

// ── Cache key ─────────────────────────────────────────────────────────────────

/**
 * Genera una cache key determinista para evitar llamadas duplicadas a Claude.
 * Mismos números + mismo tipo = misma lectura (salvo personalYear que puede cambiar).
 */
function buildCacheKey(type: ReadingType, members: Array<{ numbers: MemberNumbers }>): string {
  const numStr = members
    .map(m => `${m.numbers.soul}:${m.numbers.personality}:${m.numbers.karma}:${m.numbers.destiny}:${m.numbers.mission}:${m.numbers.personalYear}`)
    .sort()
    .join('|');
  return `${type}::${numStr}`;
}

// ── Fetch miembros ─────────────────────────────────────────────────────────────

async function fetchMembers(
  memberIds: string[],
  userId: string
): Promise<FamilyMemberRow[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .in('id', memberIds)
    .eq('user_id', userId); // RLS extra — solo miembros del usuario autenticado

  if (error) throw new Error(`Error fetching family members: ${error.message}`);
  if (!data || data.length === 0) throw new Error('No members found for given IDs');
  if (data.length !== memberIds.length) {
    throw new Error('Some member IDs were not found or do not belong to this user');
  }

  return data as FamilyMemberRow[];
}

// ── Verificar caché ────────────────────────────────────────────────────────────

async function findCachedReading(
  userId: string,
  cacheKey: string
): Promise<{ id: string; full_content: ReadingContent; html_export: string | null } | null> {
  const { data, error } = await supabase
    .from('readings')
    .select('id, full_content, html_export')
    .eq('user_id', userId)
    .eq('cache_key', cacheKey)
    .not('full_content', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data as { id: string; full_content: ReadingContent; html_export: string | null } | null;
}

// ── Llamar a Claude ───────────────────────────────────────────────────────────

function parseClaudeJson<T>(rawText: string, label: string): T {
  if (!rawText.trim()) throw new Error(`${label}: empty response`);
  const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(`[${label}] No JSON found:`, rawText.substring(0, 500));
    throw new Error('Claude response did not contain valid JSON');
  }
  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    console.error(`[${label}] JSON parse failed:`, jsonMatch[0].substring(0, 500));
    throw new Error('Failed to parse Claude response as JSON');
  }
}

async function callClaudeRaw(
  model: string,
  maxTokens: number,
  prompt: string,
  label: string,
): Promise<string> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system:     SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const rawText = response.content
    .filter(block => block.type === 'text')
    .map(block => (block as { type: 'text'; text: string }).text)
    .join('');

  if (response.stop_reason === 'max_tokens') {
    console.error(`[${label}] Truncated (${response.usage?.output_tokens} tokens)`);
    throw new Error('Claude response was truncated — increase token limit');
  }
  return rawText;
}

function buildFamilyData(members: FamilyMemberRow[]) {
  const allNumbers = members.map(m => m.numbers!.destiny);
  const destinySum = allNumbers.reduce((a, b) => a + b, 0);
  const familyNumber = destinySum > 9 ? (destinySum % 9 || 9) : destinySum;

  const freq: Record<number, number> = {};
  for (const m of members) {
    if (!m.numbers) continue;
    for (const n of [m.numbers.soul, m.numbers.personality, m.numbers.karma, m.numbers.destiny, m.numbers.mission]) {
      freq[n] = (freq[n] ?? 0) + 1;
    }
  }
  const dominantNumbers = Object.entries(freq)
    .filter(([, c]) => c >= 3)
    .map(([n]) => parseInt(n));

  return {
    members: members.map(m => ({
      id:              m.id,
      firstName:       m.first_name,
      paternalSurname: m.paternal_surname,
      relation:        m.relation,
      numbers:         m.numbers!,
    })),
    familyNumber,
    dominantNumbers,
  };
}

async function callClaude(
  type: ReadingType,
  members: FamilyMemberRow[]
): Promise<ReadingContent> {
  let promptInput: Parameters<typeof buildPrompt>[0];

  if (type === 'personal') {
    const m = members[0];
    if (!m.numbers) throw new Error('Member has no calculated numbers');
    promptInput = {
      type: 'personal',
      data: {
        firstName:       m.first_name,
        paternalSurname: m.paternal_surname,
        maternalSurname: m.maternal_surname,
        numbers:         m.numbers,
      },
    };
  } else if (type === 'compatibility') {
    if (members.length < 2) throw new Error('Compatibility reading requires exactly 2 members');
    const [m1, m2] = members;
    if (!m1.numbers || !m2.numbers) throw new Error('Members have no calculated numbers');

    const destSum = m1.numbers.destiny + m2.numbers.destiny;
    const relationshipNumber = destSum > 9 && destSum !== 10 && destSum !== 11 && destSum !== 22 && destSum !== 33
      ? destSum % 9 || 9
      : destSum;

    promptInput = {
      type: 'compatibility',
      data: {
        person1: { firstName: m1.first_name, paternalSurname: m1.paternal_surname, maternalSurname: m1.maternal_surname, numbers: m1.numbers },
        person2: { firstName: m2.first_name, paternalSurname: m2.paternal_surname, maternalSurname: m2.maternal_surname, numbers: m2.numbers },
        relationshipNumber,
      },
    };
  } else {
    // Family: 2 llamadas paralelas — lectura principal + roles individuales
    if (members.length < 2) throw new Error('Family reading requires at least 2 members');

    const familyData = buildFamilyData(members);
    promptInput = { type: 'family', data: familyData };

    const mainPrompt = buildPrompt(promptInput);

    // Generar lectura principal + un rol por miembro, todo en paralelo
    const rolePromises = familyData.members.map(m =>
      callClaudeRaw(CLAUDE_MODELS.familyRoles, 1000, buildSingleRolePrompt(m, familyData.familyNumber), `role-${m.firstName}`)
    );

    const [mainRaw, ...roleTexts] = await Promise.all([
      callClaudeRaw(CLAUDE_MODELS.family, TOKEN_LIMITS.family, mainPrompt, 'family-main'),
      ...rolePromises,
    ]);

    const mainContent = parseClaudeJson<ReadingContent>(mainRaw, 'family-main');

    // Construir individualRoles: { memberId: roleText }
    const roles: Record<string, string> = {};
    familyData.members.forEach((m, i) => {
      roles[m.id] = roleTexts[i].trim();
    });

    if (!mainContent.family) {
      mainContent.family = { familyNumber: familyData.familyNumber, dynamics: '', strengths: '', shadows: '', individualRoles: {} };
    }
    mainContent.family.individualRoles = roles;
    return mainContent;
  }

  // Personal / Compatibility: una sola llamada
  const userPrompt = buildPrompt(promptInput);
  const rawText = await callClaudeRaw(CLAUDE_MODELS[type], TOKEN_LIMITS[type], userPrompt, type);
  return parseClaudeJson<ReadingContent>(rawText, type);
}

// ── Guardar lectura en Supabase ────────────────────────────────────────────────

async function saveReading(params: {
  userId: string;
  type: ReadingType;
  memberIds: string[];
  cacheKey: string;
  content: ReadingContent;
  summary: string;
}): Promise<string> {
  const { userId, type, memberIds, cacheKey, content, summary } = params;

  const { data, error } = await supabase
    .from('readings')
    .insert({
      user_id:      userId,
      type,
      members:      memberIds,
      cache_key:    cacheKey,
      summary,
      full_content: content,
      html_export:  null, // Se genera asincrónicamente después
    })
    .select('id')
    .single();

  if (error) throw new Error(`Error saving reading: ${error.message}`);
  return data.id as string;
}

// ── Función principal exportada ───────────────────────────────────────────────

export async function generateReading(params: {
  userId: string;
  type: ReadingType;
  memberIds: string[];
}): Promise<GenerateReadingResponse> {
  const { userId, type, memberIds } = params;

  // 1. Validar cantidad de miembros según tipo
  const expectedCounts: Record<ReadingType, string> = {
    personal:      '1',
    compatibility: '2',
    family:        '2 o más',
  };
  if (type === 'personal' && memberIds.length !== 1) {
    throw new Error(`Personal reading requires exactly 1 member, got ${memberIds.length}`);
  }
  if (type === 'compatibility' && memberIds.length !== 2) {
    throw new Error(`Compatibility reading requires exactly 2 members, got ${memberIds.length}`);
  }
  if (type === 'family' && memberIds.length < 2) {
    throw new Error(`Family reading requires at least 2 members, got ${memberIds.length}`);
  }
  void expectedCounts; // evitar warning de unused

  // 2. Fetch de los miembros desde Supabase
  const members = await fetchMembers(memberIds, userId);

  // 3. Recalcular números con la fecha actual (año personal cambia cada año)
  for (const m of members) {
    m.numbers = recalculateNumbers(m);
  }

  // 4. Construir cache key y buscar en caché
  const cacheKey = buildCacheKey(type, members as Array<FamilyMemberRow & { numbers: MemberNumbers }>);
  const cached = await findCachedReading(userId, cacheKey);

  if (cached) {
    return {
      readingId: cached.id,
      type,
      content:   cached.full_content,
      htmlUrl:   cached.html_export,
      cached:    true,
    };
  }

  // 5. Llamar a Claude API
  const content = await callClaude(type, members);

  // 6. Generar summary (resumen gratuito — primer párrafo del intro)
  const summary = content.intro.split('.').slice(0, 2).join('.') + '.';

  // 7. Guardar en Supabase
  const readingId = await saveReading({
    userId,
    type,
    memberIds,
    cacheKey,
    content,
    summary,
  });

  // 8. Disparar generación de HTML en background — no bloquea la respuesta
  void scheduleHtmlExport({ readingId, userId, type, members, content });

  return {
    readingId,
    type,
    content,
    htmlUrl: null, // Se genera en background — disponible en segundos
    cached:  false,
  };

  // ⬆ return arriba — el código de abajo se ejecuta pero no bloquea la respuesta
  // (Node.js: la Promise corre en el event loop pero la función ya retornó)
}

// ── Background HTML export ────────────────────────────────────────────────────
// Se llama después del return de generateReading() usando .then()
// en el caller, o como fire-and-forget aquí:

async function scheduleHtmlExport(params: {
  readingId: string;
  userId:    string;
  type:      ReadingType;
  members:   FamilyMemberRow[];
  content:   ReadingContent;
}): Promise<void> {
  try {
    const result = await generateAndUploadHtml(params);
    if (result) {
      const { generateAndUploadJpg } = await import('./jpg-export.service');
      await generateAndUploadJpg({
        readingId: params.readingId,
        userId:    params.userId,
        html:      result.html,
      });
    }
  } catch (err) {
    console.error('[reading-service] Background export failed:', err);
  }
}
