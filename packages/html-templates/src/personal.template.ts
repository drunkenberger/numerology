// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE — Lectura Personal (estilo referencia dark-theme)
// ─────────────────────────────────────────────────────────────────────────────

import { getSharedCSS, getNumberMeta } from './styles';
import {
  esc, paragraphs, formatDate, renderNumbersGrid,
  renderInsightCard, renderQuoteBox, wrapPage,
} from './utils';
import type { TemplateInput } from './types';

export function renderPersonalReading(input: TemplateInput): string {
  const { members, content, interpretation = 'hindu', generatedAt = new Date() } = input;
  const m = members[0];
  if (!m) throw new Error('Personal reading requires exactly 1 member');

  const fullName = `${m.firstName} ${m.paternalSurname} ${m.maternalSurname}`.trim();
  const soulMeta = getNumberMeta(m.numbers.soul);
  const interpLabel = interpretation === 'hindu' ? '☸ Hindu' : '△ Pitagórica';
  const interpColor = interpretation === 'hindu' ? '#E8A04A' : '#90CAF9';

  // Header with soul symbol glow
  const header = `
    <div class="header">
      <span class="union-symbol">${soulMeta.symbol}</span>
      <h1>Lectura Personal</h1>
      <p class="interp-badge" style="color:${interpColor};border-color:${interpColor}40">${interpLabel}</p>
      <p class="subtitle">${esc(fullName)}</p>
    </div>`;

  // Number grid
  const mapSection = `
    <div class="section-title">Tu Mapa Numerológico</div>
    ${renderNumbersGrid(m.numbers)}`;

  // Intro as quote box
  const intro = `
    <div class="insight-card gold">
      <div class="insight-body" style="font-style:italic;">
        ${paragraphs(content.intro)}
      </div>
    </div>`;

  // Section title
  const sectionTitle = `<div class="section-title">Las Dimensiones de Tu Mapa</div>`;

  // Insight cards for each section
  const sections = [
    { variant: 'harmony' as const, icon: '♡', title: 'El Alma',      key: 'soul' as const,         num: m.numbers.soul },
    { variant: 'gift'    as const, icon: '◇', title: 'El Regalo',    key: 'personality' as const,  num: m.numbers.personality },
    { variant: 'shadow'  as const, icon: '⊕', title: 'El Karma',     key: 'karma' as const,        num: m.numbers.karma },
    { variant: 'tension' as const, icon: '∞', title: 'El Destino',   key: 'destiny' as const,      num: m.numbers.destiny },
    { variant: 'family'  as const, icon: '✦', title: 'La Misión',    key: 'mission' as const,      num: m.numbers.mission },
    { variant: 'gold'    as const, icon: '◯', title: 'Año Personal', key: 'personalYear' as const, num: m.numbers.personalYear },
  ];

  const insightCards = sections.map(s => {
    const meta = getNumberMeta(s.num);
    return renderInsightCard({
      variant: s.variant,
      icon: s.icon,
      title: s.title,
      tags: [`${meta.symbol} ${s.num} · ${meta.label}`],
      body: content[s.key],
    });
  }).join('\n');

  // Synthesis
  const synthesis = `
    <div class="synthesis personal-synth">
      <h2>✦ Síntesis del Mapa ✦</h2>
      ${paragraphs(content.synthesis)}
    </div>`;

  // Shadow
  const shadow = content.shadow
    ? renderInsightCard({ variant: 'shadow', icon: '◐', title: 'La Sombra', body: content.shadow })
    : '';

  // Footer
  const footer = `
    <div class="footer">
      <p>Lectura Personal Numerológica · ${formatDate(generatedAt)}</p>
      <p style="margin-top:7px; font-size:0.78rem">Generado por Jyotish Numerology · Para uso personal y espiritual</p>
    </div>`;

  return wrapPage({
    title:  `Lectura Personal — ${fullName}`,
    css:    getSharedCSS(),
    header,
    body:   [mapSection, intro, sectionTitle, insightCards, synthesis, shadow].join('\n'),
    footer,
  });
}
