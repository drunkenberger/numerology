// ─────────────────────────────────────────────────────────────────────────────
// TYPES — packages/html-templates
// Reutiliza la misma forma de datos que llega del reading.service
// ─────────────────────────────────────────────────────────────────────────────

export type ReadingType = 'personal' | 'compatibility' | 'family';
export type Interpretation = 'hindu' | 'pythagorean';

export interface MemberNumbers {
  soul: number;
  personality: number;
  karma: number;
  destiny: number;
  mission: number;
  personalYear: number;
}

export interface ReadingMember {
  id?: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  relation?: string;
  numbers: MemberNumbers;
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
  individualRoles: Record<string, string>;
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
  compatibility?: CompatibilityContent;
  family?: FamilyContent;
}

export interface TemplateInput {
  type: ReadingType;
  interpretation?: Interpretation;
  members: ReadingMember[];
  content: ReadingContent;
  generatedAt?: Date;
  language?: 'es' | 'en';
}
