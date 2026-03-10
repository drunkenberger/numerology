// ─────────────────────────────────────────────────────────────────────────────
// COMPATIBILITY PARTS — Sub-renders para el template de compatibilidad
// ─────────────────────────────────────────────────────────────────────────────

import { getNumberMeta, formatNumber, isMasterNumber } from './styles';
import { esc, renderNumbersGrid } from './utils';
import type { ReadingMember, MemberNumbers } from './types';

// ── Names banner (3-column grid) ────────────────────────────────────────────

export function renderNamesBanner(
  m1: ReadingMember, m2: ReadingMember, relNum: number
): string {
  const name1 = `${m1.firstName} ${m1.paternalSurname}`.trim();
  const name2 = `${m2.firstName} ${m2.paternalSurname}`.trim();
  const nums1 = m1.numbers;
  const nums2 = m2.numbers;

  const miniNums = (n: MemberNumbers, cls: string) => [
    { label: 'Alma', val: n.soul },
    { label: 'Regalo', val: n.personality },
    { label: 'Karma', val: n.karma },
    { label: 'Destino', val: n.destiny },
    { label: 'Misión', val: n.mission },
  ].map(x => `<span class="mini-num ${cls}">${x.label} ${formatNumber(x.val)}</span>`).join('');

  return `
    <div class="names-row">
      <div class="person-card him">
        <div class="person-name him">${esc(name1)}</div>
        <div class="mini-nums">${miniNums(nums1, 'him-n')}</div>
      </div>
      <div class="union-center">♾️</div>
      <div class="person-card her">
        <div class="person-name her">${esc(name2)}</div>
        <div class="mini-nums">${miniNums(nums2, 'her-n')}</div>
      </div>
    </div>`;
}

// ── Comparison table ─────────────────────────────────────────────────────────

export function renderCompareTable(
  name1: string, nums1: MemberNumbers,
  name2: string, nums2: MemberNumbers
): string {
  const rows = [
    { label: 'Alma',         v1: nums1.soul,         v2: nums2.soul },
    { label: 'Regalo',       v1: nums1.personality,  v2: nums2.personality },
    { label: 'Karma',        v1: nums1.karma,        v2: nums2.karma },
    { label: 'Destino',      v1: nums1.destiny,      v2: nums2.destiny },
    { label: 'Misión',       v1: nums1.mission,      v2: nums2.mission },
    { label: 'Año personal', v1: nums1.personalYear, v2: nums2.personalYear },
  ].map(r => `
    <tr>
      <td class="him-val">${formatNumber(r.v1)}</td>
      <td class="mid-label">${r.label}</td>
      <td class="her-val">${formatNumber(r.v2)}</td>
    </tr>`).join('');

  return `
    <div class="section-title">Sus Números Cara a Cara</div>
    <table class="compare-table">
      <thead><tr>
        <th class="him-col">${esc(name1)}</th>
        <th class="mid-col">Dimensión</th>
        <th class="her-col">${esc(name2)}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── Dual number maps (side by side) ──────────────────────────────────────────

export function renderDualMaps(
  name1: string, nums1: MemberNumbers,
  name2: string, nums2: MemberNumbers
): string {
  return `
    <div class="dual-maps">
      <div class="dual-map-col">
        <h3 class="dual-map-name">${esc(name1)}</h3>
        ${renderNumbersGrid(nums1)}
      </div>
      <div class="dual-map-col">
        <h3 class="dual-map-name">${esc(name2)}</h3>
        ${renderNumbersGrid(nums2)}
      </div>
    </div>`;
}

// ── Extra CSS for compatibility ──────────────────────────────────────────────

export function getCompatibilityCSS(): string {
  return `
    .names-row {
      display: grid; grid-template-columns: 1fr auto 1fr;
      gap: 0; align-items: center; margin-bottom: 50px;
    }
    .person-card { padding: 22px 20px; text-align: center; }
    .person-card.him {
      background: rgba(91,155,213,0.07);
      border: 1px solid rgba(91,155,213,0.25); border-right: none;
    }
    .person-card.her {
      background: rgba(201,123,138,0.07);
      border: 1px solid rgba(201,123,138,0.25); border-left: none;
    }
    .person-name { font-family: 'Cinzel', serif; font-size: 1rem; letter-spacing: 0.1em; margin-bottom: 12px; }
    .person-name.him { color: var(--him-light); }
    .person-name.her { color: var(--her-light); }
    .mini-nums { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .mini-num { font-family: 'Cinzel', serif; font-size: 0.75rem; padding: 2px 8px; }
    .mini-num.him-n { background: rgba(91,155,213,0.12); border: 1px solid rgba(91,155,213,0.3); color: var(--him-light); }
    .mini-num.her-n { background: rgba(201,123,138,0.12); border: 1px solid rgba(201,123,138,0.3); color: var(--her-light); }
    .union-center {
      width: 70px; height: 70px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.3);
      font-size: 1.6rem; flex-shrink: 0; position: relative; z-index: 1;
    }

    .compare-table { width: 100%; border-collapse: collapse; margin-bottom: 55px; }
    .compare-table th {
      font-family: 'Cinzel', serif; font-size: 0.65rem;
      letter-spacing: 0.25em; text-transform: uppercase;
      padding: 12px 16px; border-bottom: 1px solid rgba(201,168,76,0.2);
    }
    .compare-table th.him-col { color: var(--him-light); text-align: right; }
    .compare-table th.mid-col { color: var(--union); text-align: center; width: 120px; }
    .compare-table th.her-col { color: var(--her-light); text-align: left; }
    .compare-table td { padding: 10px 16px; font-size: 0.88rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .compare-table td.him-val { text-align: right; color: var(--him-light); font-family: 'Cinzel', serif; font-size: 1.6rem; line-height: 1; }
    .compare-table td.her-val { text-align: left; color: var(--her-light); font-family: 'Cinzel', serif; font-size: 1.6rem; line-height: 1; }
    .compare-table td.mid-label { text-align: center; font-family: 'Cinzel', serif; font-size: 0.6rem; letter-spacing: 0.15em; color: var(--text-dim); text-transform: uppercase; }
    .compare-table tr:hover td { background: rgba(255,255,255,0.02); }

    .dual-maps { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0; }
    @media(max-width:600px) { .dual-maps { grid-template-columns: 1fr; } }
    .dual-map-name {
      font-size: 0.75rem; letter-spacing: 0.15em; text-align: center;
      color: var(--union); margin-bottom: 0.75rem; text-transform: uppercase;
    }
    .dual-maps .numbers-grid { grid-template-columns: repeat(2, 1fr); }
  `;
}
