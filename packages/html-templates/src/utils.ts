// ─────────────────────────────────────────────────────────────────────────────
// UTILS — Bloques HTML reutilizables (legacy + nuevo insight system)
// ─────────────────────────────────────────────────────────────────────────────

import { getNumberMeta, formatNumber, isMasterNumber } from './styles';
import type { MemberNumbers } from './types';

// ── Escape & format ──────────────────────────────────────────────────────────

export function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function paragraphs(text: string): string {
  return text
    .split(/\n\n|\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${esc(p)}</p>`)
    .join('\n');
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function ornament(): string {
  return `<div class="ornament">✦ · · · ✦ · · · ✦</div>`;
}

// ── Number cards grid ────────────────────────────────────────────────────────

export function renderNumbersGrid(numbers: MemberNumbers): string {
  const cards = [
    { label: 'Alma',         value: numbers.soul,         icon: '♡' },
    { label: 'Regalo',       value: numbers.personality,  icon: '◇' },
    { label: 'Karma',        value: numbers.karma,        icon: '⊕' },
    { label: 'Destino',      value: numbers.destiny,      icon: '∞' },
    { label: 'Misión',       value: numbers.mission,      icon: '✦' },
    { label: 'Año Personal', value: numbers.personalYear, icon: '◯' },
  ];

  const html = cards.map(({ label, value, icon }) => {
    const meta = getNumberMeta(value);
    const master = isMasterNumber(value);
    const cls = master ? 'number-card master' : 'number-card';
    const badge = master
      ? '<span class="master-badge">MAESTRO</span>'
      : value === 10 ? '<span class="special-badge">ESPECIAL</span>' : '';

    return `
      <div class="${cls}" style="--accent-color: ${meta.accent}">
        <div class="card-label">${esc(label)}</div>
        <div class="card-number">${formatNumber(value)}</div>
        <div class="card-symbol">${icon} ${esc(meta.symbol)}</div>
        <div class="card-name">${esc(meta.label)}</div>
        ${badge}
      </div>`;
  }).join('');

  return `<div class="numbers-grid">${html}</div>`;
}

// ── Legacy section (backward-compat) ─────────────────────────────────────────

export function renderSection(cfg: {
  icon: string; title: string; number?: number; content: string; isSynthesis?: boolean;
}): string {
  const badge = cfg.number !== undefined
    ? `<span class="section-badge">${formatNumber(cfg.number)}</span>` : '';

  const inner = `
    <div class="section-header">
      <div class="section-icon">${cfg.icon}</div>
      <h2>${esc(cfg.title)}</h2>
      ${badge}
    </div>
    <div class="section-content">${paragraphs(cfg.content)}</div>`;

  if (cfg.isSynthesis) return `<div class="synthesis-section">${inner}</div>`;
  return `<div class="section">${inner}</div>`;
}

// ── New insight card system ──────────────────────────────────────────────────

export type InsightVariant = 'harmony' | 'tension' | 'gift' | 'shadow' | 'family' | 'gold';

export function renderInsightCard(cfg: {
  variant: InsightVariant;
  icon: string;
  title: string;
  tags?: string[];
  body: string;
}): string {
  const tagHtml = cfg.tags?.map(t =>
    `<span class="tag gold-tag">${esc(t)}</span>`
  ).join('') ?? '';

  return `
    <div class="insight-card ${cfg.variant}">
      <div class="insight-header">
        <span class="insight-icon">${cfg.icon}</span>
        <span class="insight-title ${cfg.variant}">${esc(cfg.title)}</span>
        ${tagHtml ? `<div class="tag-row">${tagHtml}</div>` : ''}
      </div>
      <div class="insight-body">${paragraphs(cfg.body)}</div>
    </div>`;
}

export function renderQuoteBox(text: string, variant: 'him' | 'her' | 'union' | 'gold' = 'gold'): string {
  const cls = variant === 'gold' ? 'union-q' : `${variant}-q`;
  return `<div class="quote-box ${cls}">${esc(text)}</div>`;
}

export function renderSplitBox(
  left: { label: string; text: string },
  right: { label: string; text: string }
): string {
  return `
    <div class="split-box">
      <div class="split-him">
        <div class="split-label him-l">${esc(left.label)}</div>
        <div class="split-text">${esc(left.text)}</div>
      </div>
      <div class="split-her">
        <div class="split-label her-l">${esc(right.label)}</div>
        <div class="split-text">${esc(right.text)}</div>
      </div>
    </div>`;
}

export function renderDotItem(text: string, variant: 'him' | 'her' | 'union' | 'gold' = 'gold'): string {
  const cls = variant === 'gold' ? 'dot-union' : `dot-${variant}`;
  return `<div class="dot-item ${cls}">${esc(text)}</div>`;
}

export function renderScoreItem(label: string, score: number, maxLabel: string): string {
  const pct = Math.min(score * 10, 100);
  return `
    <div class="score-item">
      <span class="score-label">${esc(label)}</span>
      <div class="score-num" style="color:#E8C97A">${score.toFixed(1)}</div>
      <div class="score-bar">
        <div class="score-fill" style="width:${pct}%; background:linear-gradient(to right,#5B9BD5,#C97B8A);"></div>
      </div>
      <span style="font-size:0.7rem; color:var(--text-dim); font-family:'Cinzel',serif; letter-spacing:0.1em;">${esc(maxLabel)}</span>
    </div>`;
}

// ── Full page wrapper ────────────────────────────────────────────────────────

export function wrapPage(params: {
  title: string; css: string; header: string; body: string; footer: string;
}): string {
  const { title, css, header, body, footer } = params;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <style>${css}</style>
</head>
<body>
  <div class="container">
    ${header}
    ${body}
    ${footer}
  </div>
</body>
</html>`;
}
