// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE — Lectura de Compatibilidad (estilo referencia dark-theme)
// ─────────────────────────────────────────────────────────────────────────────

import { getSharedCSS } from './styles';
import {
  esc, paragraphs, formatDate, renderInsightCard,
  renderQuoteBox, wrapPage,
} from './utils';
import {
  renderNamesBanner, renderCompareTable,
  getCompatibilityCSS,
} from './compatibility.parts';
import type { TemplateInput } from './types';

export function renderCompatibilityReading(input: TemplateInput): string {
  const { members, content, generatedAt = new Date() } = input;
  const [m1, m2] = members;
  if (!m1 || !m2) throw new Error('Compatibility reading requires exactly 2 members');

  const name1 = `${m1.firstName} ${m1.paternalSurname}`.trim();
  const name2 = `${m2.firstName} ${m2.paternalSurname}`.trim();

  // Header
  const header = `
    <div class="header">
      <span class="union-symbol">☯</span>
      <h1>Compatibilidad Numerológica</h1>
      <p class="subtitle">Lectura de almas en unión · ${esc(name1)} &amp; ${esc(name2)}</p>
    </div>`;

  // Names banner + comparison table
  const namesBanner = renderNamesBanner(m1, m2, 0);
  const compareTable = renderCompareTable(name1, m1.numbers, name2, m2.numbers);

  // Section title
  const sectionTitle = `<div class="section-title">Las Dinámicas de Su Unión</div>`;

  // Insight cards for each section
  const insightCards = [
    renderInsightCard({ variant: 'harmony', icon: '♡', title: 'Dinámica del Alma', body: content.soul }),
    renderInsightCard({ variant: 'gift',    icon: '◇', title: 'Cómo se Perciben', body: content.personality }),
    renderInsightCard({ variant: 'shadow',  icon: '⊕', title: 'Los Karmas en Juego', body: content.karma }),
    renderInsightCard({ variant: 'tension', icon: '∞', title: 'Los Caminos de Vida', body: content.destiny }),
    renderInsightCard({ variant: 'family',  icon: '✦', title: 'Las Misiones', body: content.mission }),
    renderInsightCard({ variant: 'tension', icon: '◯', title: 'El Momento Actual', body: content.personalYear }),
  ].join('\n');

  // Compatibility extras
  const compat = content.compatibility;
  const compatExtra = compat ? [
    renderInsightCard({ variant: 'harmony', icon: '↔', title: 'Resonancias Poderosas', body: compat.resonances }),
    renderInsightCard({ variant: 'tension', icon: '△', title: 'Desafíos del Vínculo', body: compat.challenges }),
    renderInsightCard({ variant: 'gift',    icon: '◎', title: 'Potencial Máximo', body: compat.potential }),
    renderInsightCard({ variant: 'family',  icon: '◯', title: 'Momento Presente', body: compat.currentMoment }),
  ].join('\n') : '';

  // Synthesis
  const synthesis = `
    <div class="synthesis">
      <h2>✦ El Alma de Esta Unión ✦</h2>
      ${paragraphs(content.synthesis).replace(/<p>/g, '<p>').replace(/<\/p>/g, '</p>')}
    </div>`;

  // Shadow
  const shadow = content.shadow
    ? renderInsightCard({ variant: 'shadow', icon: '◐', title: 'Sombras del Vínculo', body: content.shadow })
    : '';

  // Footer
  const footer = `
    <div class="footer">
      <p>Lectura de Compatibilidad Numerológica · ${formatDate(generatedAt)}</p>
      <p style="margin-top:7px; font-size:0.78rem">Generado por Jyotish Numerology</p>
    </div>`;

  return wrapPage({
    title:  `Compatibilidad — ${name1} & ${name2}`,
    css:    getSharedCSS() + getCompatibilityCSS(),
    header,
    body:   [namesBanner, compareTable, sectionTitle, insightCards, compatExtra, synthesis, shadow].join('\n'),
    footer,
  });
}
