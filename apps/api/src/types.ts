// ─────────────────────────────────────────────────────────────────────────────
// TYPES — apps/api
// ─────────────────────────────────────────────────────────────────────────────

// ── Request / Response ────────────────────────────────────────────────────────

export type ReadingType = 'personal' | 'compatibility' | 'family';
export type Interpretation = 'hindu' | 'pythagorean';

export interface GenerateReadingRequest {
  type: ReadingType;
  interpretation: Interpretation;
  /** IDs de los registros en la tabla family_members de Supabase */
  memberIds: string[];
}

export interface GenerateReadingResponse {
  readingId: string;
  type: ReadingType;
  interpretation: Interpretation;
  content: ReadingContent;
  htmlUrl: string | null;
  cached: boolean;
}

// ── Reading content (lo que Claude genera) ────────────────────────────────────

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
  // Para lecturas de compatibilidad y familia
  compatibility?: CompatibilityContent;
  family?: FamilyContent;
}

export interface CompatibilityContent {
  resonances: string;
  challenges: string;
  potential: string;
  currentMoment: string;
}

export interface FamilyContent {
  familyNumber: number;
  dynamics: string;
  strengths: string;
  shadows: string;
  individualRoles: Record<string, string>; // memberId → descripción de su rol
}

// ── Supabase row types ─────────────────────────────────────────────────────────

export interface ProfileRow {
  id: string;
  first_name: string;
  paternal_surname: string;
  maternal_surname: string;
  birth_day: number;
  birth_month: number;
  birth_year: number;
  language: string;
  is_premium: boolean;
  reading_credits: number;
  rc_customer_id: string | null;
  created_at: string;
}

export interface FamilyMemberRow {
  id: string;
  user_id: string;
  first_name: string;
  paternal_surname: string;
  maternal_surname: string;
  birth_day: number;
  birth_month: number;
  birth_year: number;
  relation: string;
  numbers: MemberNumbers | null;
  created_at: string;
}

export interface MemberNumbers {
  soul: number;
  personality: number;
  karma: number;
  destiny: number;
  mission: number;
  personalYear: number;
}

export interface ReadingRow {
  id: string;
  user_id: string;
  type: ReadingType;
  interpretation: Interpretation;
  members: string[];
  cache_key: string;
  summary: string;
  full_content: ReadingContent | null;
  html_export: string | null;
  jpg_export: string | null;
  created_at: string;
}

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

// ── Summary content (resumen rápido del mapa) ────────────────────────────────

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

// ── Express extensions ────────────────────────────────────────────────────────

import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId: string;
  isPremium: boolean;
  readingCredits: number;
}
