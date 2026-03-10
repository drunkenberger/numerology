// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE — Lectura Familiar (estilo referencia dark-theme)
// ─────────────────────────────────────────────────────────────────────────────

import { getSharedCSS, getNumberMeta, formatNumber, isMasterNumber } from './styles';
import {
  esc, paragraphs, formatDate, renderNumbersGrid,
  renderInsightCard, wrapPage,
} from './utils';
import type { TemplateInput, ReadingMember } from './types';

// Colores únicos por miembro
const MEMBER_ACCENTS = ['#5B9BD5', '#C97B8A', '#7EC8A4', '#E8A04A', '#CE93D8', '#80CBC4', '#F48FB1', '#90CAF9'];

function renderConstellation(members: ReadingMember[], familyNumber: number): string {
  const meta = getNumberMeta(familyNumber);
  const master = isMasterNumber(familyNumber);

  const pills = members.map((m, i) => {
    const accent = MEMBER_ACCENTS[i % MEMBER_ACCENTS.length];
    return `
      <div class="member-pill" style="border-color: ${accent}40;">
        <div class="member-destiny" style="color:${accent}">${formatNumber(m.numbers.destiny)}</div>
        <div class="member-name">${esc(m.firstName)}</div>
        <div class="member-rel">${esc(m.relation ?? 'integrante')}</div>
      </div>`;
  }).join('');

  return `
    <div class="family-constellation">
      <div class="family-members-row">${pills}</div>
      <div class="family-number-block ${master ? 'master' : ''}" style="--accent:${meta.accent}">
        <div class="fn-label">Número Familiar</div>
        <div class="fn-number">${formatNumber(familyNumber)}</div>
        <div class="fn-symbol">${meta.symbol}</div>
        <div class="fn-name">${esc(meta.label)}</div>
      </div>
    </div>`;
}

function renderMemberMaps(members: ReadingMember[]): string {
  const cols = members.map((m, i) => {
    const accent = MEMBER_ACCENTS[i % MEMBER_ACCENTS.length];
    const fullName = `${m.firstName} ${m.paternalSurname}`.trim();
    return `
      <div class="member-map-col">
        <h3 class="member-map-name" style="color:${accent}">${esc(fullName)}</h3>
        <div class="member-map-rel">${esc(m.relation ?? '')}</div>
        ${renderNumbersGrid(m.numbers)}
      </div>`;
  }).join('');

  return `<div class="members-maps-grid">${cols}</div>`;
}

function renderRoles(members: ReadingMember[], roles: Record<string, string>): string {
  const items = members.map((m, i) => {
    const accent = MEMBER_ACCENTS[i % MEMBER_ACCENTS.length];
    const roleText = (m.id && roles[m.id]) ? roles[m.id] : Object.values(roles)[i] ?? null;
    if (!roleText) return '';
    const fullName = `${m.firstName} ${m.paternalSurname}`.trim();
    return `
      <div class="role-item" style="border-left-color: ${accent};">
        <div class="role-name" style="color:${accent}">${esc(fullName)}</div>
        <div class="role-text">${paragraphs(roleText)}</div>
      </div>`;
  }).filter(Boolean).join('');

  if (!items) return '';

  return `
    <div class="section-title">El Rol de Cada Integrante</div>
    <div class="roles-grid">${items}</div>`;
}

export function renderFamilyReading(input: TemplateInput): string {
  const { members, content, generatedAt = new Date() } = input;
  if (members.length < 2) throw new Error('Family reading requires at least 2 members');

  const destSum = members.reduce((s, m) => s + m.numbers.destiny, 0);
  const familyNumber = [10, 11, 22, 33].includes(destSum)
    ? destSum : destSum > 9 ? (destSum % 9 || 9) : destSum;

  const familyNames = members.map(m => m.firstName).join(', ');
  const famMeta = getNumberMeta(familyNumber);

  // Header
  const header = `
    <div class="header">
      <span class="union-symbol">${famMeta.symbol}</span>
      <h1>Lectura Familiar</h1>
      <p class="subtitle">${esc(familyNames)}</p>
    </div>`;

  const constellation = renderConstellation(members, familyNumber);

  // Intro
  const intro = `
    <div class="insight-card gold">
      <div class="insight-body" style="font-style:italic;">
        ${paragraphs(content.intro)}
      </div>
    </div>`;

  const memberMaps = renderMemberMaps(members);

  // Insight cards
  const sectionTitle = `<div class="section-title">Las Dimensiones del Núcleo</div>`;
  const insightCards = [
    renderInsightCard({ variant: 'harmony', icon: '♡', title: 'El Corazón Colectivo', body: content.soul }),
    renderInsightCard({ variant: 'gift',    icon: '◇', title: 'La Imagen Familiar', body: content.personality }),
    renderInsightCard({ variant: 'shadow',  icon: '⊕', title: 'El Karma Colectivo', body: content.karma }),
    renderInsightCard({ variant: 'tension', icon: '∞', title: 'El Camino Familiar', body: content.destiny }),
    renderInsightCard({ variant: 'family',  icon: '✦', title: 'La Misión Colectiva', body: content.mission }),
    renderInsightCard({ variant: 'gold',    icon: '◯', title: 'El Momento Actual', body: content.personalYear }),
  ].join('\n');

  // Family extras
  const familyExtra = content.family ? [
    renderInsightCard({ variant: 'harmony', icon: '↔', title: 'Dinámica Relacional', body: content.family.dynamics }),
    renderInsightCard({ variant: 'gift',    icon: '★', title: 'Fortalezas Colectivas', body: content.family.strengths }),
    renderInsightCard({ variant: 'shadow',  icon: '◐', title: 'Sombras Familiares', body: content.family.shadows }),
    renderRoles(members, content.family.individualRoles),
  ].join('\n') : '';

  // Synthesis
  const synthesis = `
    <div class="synthesis family-synth">
      <h2>✦ Síntesis del Núcleo Familiar ✦</h2>
      ${paragraphs(content.synthesis)}
    </div>`;

  // Shadow ya se renderiza en familyExtra via content.family.shadows
  const shadow = '';

  // Footer
  const footer = `
    <div class="footer">
      <p>Lectura Familiar Numerológica · ${formatDate(generatedAt)}</p>
      <p style="margin-top:7px; font-size:0.78rem">Generado por Jyotish Numerology</p>
    </div>`;

  const extraCSS = `
    .family-constellation { margin: 2rem 0; padding: 1.5rem; background: var(--surface); border: 1px solid rgba(201,168,76,0.15); text-align: center; }
    .family-members-row { display: flex; justify-content: center; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1.5rem; }
    .member-pill { text-align: center; padding: 10px 14px; border: 1px solid; border-radius: 0; }
    .member-destiny { font-family: 'Cinzel', serif; font-size: 1.6rem; font-weight: 700; line-height: 1; }
    .member-name { font-size: 0.8rem; color: var(--text); margin-top: 0.25rem; }
    .member-rel { font-size: 0.65rem; letter-spacing: 0.1em; color: var(--text-dim); text-transform: uppercase; }
    .family-number-block {
      display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
      border: 1px solid var(--accent, var(--union)); border-radius: 50%;
      width: 140px; height: 140px; background: var(--surface2); margin: 0 auto;
      padding: 10px; gap: 2px;
    }
    .family-number-block.master { box-shadow: 0 0 20px rgba(201,168,76,0.2); }
    .fn-label { font-size: 0.55rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-dim); line-height: 1; }
    .fn-number { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 700; color: var(--accent, var(--union-light)); line-height: 1; }
    .fn-symbol { font-size: 0.75rem; color: var(--text-dim); line-height: 1; }
    .fn-name { font-size: 0.6rem; color: var(--text-dim); line-height: 1; }
    .members-maps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
    .member-map-name { font-size: 0.75rem; letter-spacing: 0.1em; text-align: center; margin-bottom: 0.2rem; text-transform: uppercase; }
    .member-map-rel { font-size: 0.65rem; color: var(--text-dim); text-align: center; letter-spacing: 0.1em; margin-bottom: 0.75rem; text-transform: uppercase; }
    .member-map-col .numbers-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .member-map-col .number-card .card-number { font-size: 1.6rem; }
    .roles-grid { display: grid; gap: 1.5rem; margin-bottom: 2rem; }
    .role-item { padding: 1.25rem; background: var(--surface); border-left: 3px solid var(--union-dim); }
    .role-name { font-family: 'Cinzel', serif; font-size: 0.75rem; letter-spacing: 0.1em; margin-bottom: 0.75rem; text-transform: uppercase; }
    .role-text p { font-size: 0.9rem; color: var(--text-body); }
  `;

  return wrapPage({
    title:  `Lectura Familiar — ${familyNames}`,
    css:    getSharedCSS() + extraCSS,
    header,
    body:   [constellation, intro, memberMaps, sectionTitle, insightCards, familyExtra, synthesis, shadow].join('\n'),
    footer,
  });
}
