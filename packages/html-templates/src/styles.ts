// ─────────────────────────────────────────────────────────────────────────────
// STYLES — Paleta, número metadata, y CSS assembler para templates HTML
// ─────────────────────────────────────────────────────────────────────────────

import {
  getBaseCSS, getHeaderCSS, getSectionCSS, getInsightCSS,
  getBlockCSS, getScoreCSS, getSynthesisCSS, getFooterCSS,
  getNumberCardCSS, getResponsiveCSS,
} from './styles.css';

// Paleta de colores — referencia: numerologia-compatibilidad.html
export const COLORS = {
  bgDeep:      '#0A080F',
  bgCard:      '#13101A',
  bgSection:   '#1A1624',
  bgHighlight: '#221E2E',

  gold:        '#C9A84C',
  goldLight:   '#E8C97A',
  goldDim:     '#7A6020',

  violet:      '#9B8EC8',
  violetLight: '#B8A8E8',
  indigo:      '#4a4a9e',

  textPrimary:   '#EDEAD5',
  textSecondary: '#CCC8B5',
  textMuted:     '#8A8470',

  master:  '#e8c87a',
  special: '#90caf9',
} as const;

// Mapeo de número → símbolo + etiqueta + color
export interface NumberMeta {
  symbol: string;
  label: string;
  accent: string;
}

export const NUMBER_META: Record<number, NumberMeta> = {
  1:  { symbol: '☉', label: 'Iniciador',   accent: '#e8a04a' },
  2:  { symbol: '☽', label: 'Sensitivo',   accent: '#90caf9' },
  3:  { symbol: '♃', label: 'Expresivo',   accent: '#ffcc02' },
  4:  { symbol: '♄', label: 'Constructor', accent: '#8d6e63' },
  5:  { symbol: '☿', label: 'Libre',       accent: '#80cbc4' },
  6:  { symbol: '♀', label: 'Armonioso',   accent: '#f48fb1' },
  7:  { symbol: '♆', label: 'Místico',     accent: '#ce93d8' },
  8:  { symbol: '♄', label: 'Poderoso',    accent: '#b0bec5' },
  9:  { symbol: '♂', label: 'Sabio',       accent: '#ef9a9a' },
  10: { symbol: '◉', label: 'Completo',    accent: '#90caf9' },
  11: { symbol: '★', label: 'Iluminado',   accent: '#e8c87a' },
  22: { symbol: '✦', label: 'Arquitecto',  accent: '#a98de0' },
  33: { symbol: '✸', label: 'Maestro',     accent: '#f48fb1' },
};

export function getNumberMeta(n: number): NumberMeta {
  return NUMBER_META[n] ?? { symbol: '◆', label: `Número ${n}`, accent: COLORS.gold };
}

export function isMasterNumber(n: number): boolean {
  return n === 11 || n === 22 || n === 33;
}

export function isSpecialNumber(n: number): boolean {
  return n === 10;
}

export function formatNumber(n: number): string {
  if (isMasterNumber(n)) return `${n} ✦`;
  if (isSpecialNumber(n)) return `${n} ◉`;
  return String(n);
}

// Assembla todo el CSS compartido desde styles.css.ts
export function getSharedCSS(): string {
  return [
    getBaseCSS(),
    getHeaderCSS(),
    getSectionCSS(),
    getInsightCSS(),
    getBlockCSS(),
    getScoreCSS(),
    getSynthesisCSS(),
    getFooterCSS(),
    getNumberCardCSS(),
    getResponsiveCSS(),
  ].join('\n');
}
