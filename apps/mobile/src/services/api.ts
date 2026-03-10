// ─────────────────────────────────────────────────────────────────────────────
// API CLIENT — llama al backend apps/api
// El JWT de Supabase se adjunta automáticamente a cada request.
// ─────────────────────────────────────────────────────────────────────────────

import Constants from 'expo-constants';
import { supabase } from './supabase';

const API_URL = (Constants.expoConfig?.extra?.apiUrl as string) ?? 'http://localhost:3000';

// DEV: skip auth header in development
const DEV_SKIP_AUTH = __DEV__;

async function getAuthHeader(): Promise<Record<string, string>> {
  if (DEV_SKIP_AUTH) return { 'X-Dev-User': '10f054f2-4846-4acd-aacf-bb781c0c0374' };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${session.access_token}` };
}

async function post<T>(path: string, body: unknown, timeoutMs = 90_000): Promise<T> {
  const headers = await getAuthHeader();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body:    JSON.stringify(body),
      signal:  controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new APIError(err.error ?? 'API error', res.status, err);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new APIError('La solicitud tardó demasiado. Intenta de nuevo.', 408, null);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function get<T>(path: string): Promise<T> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new APIError(err.error ?? 'API error', res.status, err);
  }
  return res.json() as Promise<T>;
}

async function del<T>(path: string): Promise<T> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new APIError(err.error ?? 'API error', res.status, err);
  }
  return res.json() as Promise<T>;
}

// ── Error tipado ──────────────────────────────────────────────────────────────

export class APIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'APIError';
  }

  get isPremiumRequired(): boolean { return this.status === 403; }
  get isUnauthorized(): boolean    { return this.status === 401; }
  get isRateLimited(): boolean     { return this.status === 429; }
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export type ReadingType = 'personal' | 'compatibility' | 'family';
export type Interpretation = 'hindu' | 'pythagorean';

export interface GenerateReadingResponse {
  readingId: string;
  type: ReadingType;
  interpretation: Interpretation;
  content: ReadingContent;
  htmlUrl: string | null;
  cached: boolean;
}

export interface ReadingContent {
  intro: string;
  soul: string;
  personality: string;
  karma: string;
  destiny: string;
  mission: string;
  personalYear: string;
  synthesis: string;
  shadow?: string;
  compatibility?: {
    resonances: string;
    challenges: string;
    potential: string;
    currentMoment: string;
  };
  family?: {
    familyNumber: number;
    dynamics: string;
    strengths: string;
    shadows: string;
    individualRoles: Record<string, string>;
  };
}

// ── Summary types ────────────────────────────────────────────────────────────

export interface SummaryHighlight {
  key: string;
  number: number;
  title: string;
  insight: string;
}

export interface SummaryContent {
  intro: string;
  highlights: SummaryHighlight[];
  currentYear: string;
  keyTheme: string;
}

export interface GenerateSummaryResponse {
  readingId: string;
  content: SummaryContent;
  cached: boolean;
}

// ── Reading list / detail types ──────────────────────────────────────────────

export interface ReadingListItem {
  id: string;
  type: ReadingType;
  interpretation: Interpretation;
  summary: string | null;
  htmlExport: string | null;
  jpgExport: string | null;
  createdAt: string;
  memberNames: string[];
}

export interface ReadingDetail {
  id: string;
  type: ReadingType;
  interpretation: Interpretation;
  members: string[];
  summary: string;
  fullContent: ReadingContent;
  htmlExport: string | null;
  jpgExport: string | null;
  createdAt: string;
}

// ── Member types ─────────────────────────────────────────────────────────────

export interface CreateMemberInput {
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  relation: string;
  numbers?: unknown;
}

export const api = {
  generateReading: (type: ReadingType, interpretation: Interpretation, memberIds: string[]) =>
    post<GenerateReadingResponse>('/generate-reading', { type, interpretation, memberIds }, 120_000),

  generateSummary: (type: ReadingType, interpretation: Interpretation, memberIds: string[]) =>
    post<GenerateSummaryResponse>('/generate-reading/summary', { type, interpretation, memberIds }),

  getReading: (id: string) =>
    get<ReadingDetail>(`/generate-reading/${id}`),

  listReadings: (type?: ReadingType) =>
    get<ReadingListItem[]>(`/generate-reading/list${type ? `?type=${type}` : ''}`),

  getMembers: () =>
    get<Record<string, unknown>[]>('/members'),

  createMember: (input: CreateMemberInput) =>
    post<Record<string, unknown>>('/members', input),

  deleteMember: (id: string) =>
    del<{ ok: boolean }>(`/members/${id}`),

  deleteReading: (id: string) =>
    del<{ ok: boolean }>(`/generate-reading/${id}`),
};
