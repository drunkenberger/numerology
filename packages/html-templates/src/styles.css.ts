// ─────────────────────────────────────────────────────────────────────────────
// STYLES CSS — CSS string para templates HTML (separado por límite de 200 líneas)
// ─────────────────────────────────────────────────────────────────────────────

import { COLORS } from './styles';

export function getBaseCSS(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=Lato:wght@300;400&display=swap');

    :root {
      --deep: ${COLORS.bgDeep};
      --surface: ${COLORS.bgCard};
      --surface2: ${COLORS.bgSection};
      --union: ${COLORS.gold};
      --union-light: ${COLORS.goldLight};
      --union-dim: ${COLORS.goldDim};
      --him: #5B9BD5;
      --him-light: #90C2E7;
      --him-dim: #2E5F8A;
      --her: #C97B8A;
      --her-light: #E8A8B5;
      --her-dim: #8B4A55;
      --text: ${COLORS.textPrimary};
      --text-dim: ${COLORS.textMuted};
      --text-body: #CCC8B5;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--deep);
      color: var(--text);
      font-family: 'Lato', sans-serif;
      font-weight: 300;
      line-height: 1.8;
      overflow-x: hidden;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse at 10% 50%, rgba(91,155,213,0.07) 0%, transparent 45%),
        radial-gradient(ellipse at 90% 50%, rgba(201,123,138,0.07) 0%, transparent 45%),
        radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 40%),
        radial-gradient(1px 1px at 15% 20%, rgba(91,155,213,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 85% 20%, rgba(201,123,138,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 50% 10%, rgba(201,168,76,0.35) 0%, transparent 100%),
        radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.15) 0%, transparent 100%),
        radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.15) 0%, transparent 100%);
      pointer-events: none;
      z-index: 0;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 60px 30px; position: relative; z-index: 1; }
  `;
}

export function getHeaderCSS(): string {
  return `
    .header { text-align: center; margin-bottom: 70px; }
    .union-symbol {
      font-size: 3rem; display: block; margin-bottom: 20px;
      animation: glow 3s ease-in-out infinite;
    }
    @keyframes glow {
      0%,100% { filter: drop-shadow(0 0 15px rgba(201,168,76,0.4)); }
      50% { filter: drop-shadow(0 0 35px rgba(201,168,76,0.8)); }
    }
    h1 {
      font-family: 'Cinzel', serif; font-size: 1.9rem;
      color: var(--union-light); letter-spacing: 0.15em;
      text-transform: uppercase; margin-bottom: 8px;
    }
    .subtitle {
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 1.1rem; color: var(--text-dim); margin-bottom: 35px;
    }
  `;
}

export function getSectionCSS(): string {
  return `
    .section-title {
      font-family: 'Cinzel', serif; font-size: 0.72rem;
      letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--union); margin-bottom: 26px;
      display: flex; align-items: center; gap: 14px;
    }
    .section-title::after {
      content: ''; flex: 1; height: 1px;
      background: linear-gradient(to right, var(--union-dim), transparent);
    }
  `;
}

export function getInsightCSS(): string {
  return `
    .insight-card { margin-bottom: 26px; overflow: hidden; position: relative; }
    .insight-card::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    }
    .insight-card.harmony::before { background: linear-gradient(to bottom, var(--him), var(--her)); }
    .insight-card.tension::before { background: #C9A84C; }
    .insight-card.gift::before    { background: #7EC8A4; }
    .insight-card.shadow::before  { background: #9B8EC8; }
    .insight-card.family::before  { background: var(--union); }
    .insight-card.gold::before    { background: var(--union); }

    .insight-header {
      display: flex; align-items: center; gap: 18px;
      padding: 18px 24px; background: var(--surface);
      border: 1px solid rgba(201,168,76,0.1);
      border-left: none; border-bottom: none;
    }
    .insight-icon { font-size: 1.6rem; opacity: 0.7; }
    .insight-title {
      font-family: 'Cinzel', serif; font-size: 0.9rem;
      letter-spacing: 0.08em; flex: 1;
    }
    .insight-title.harmony { color: var(--him-light); }
    .insight-title.tension { color: var(--union-light); }
    .insight-title.gift    { color: #8ED4A8; }
    .insight-title.shadow  { color: #B8A8E8; }
    .insight-title.family  { color: var(--union-light); }
    .insight-title.gold    { color: var(--union-light); }

    .tag-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .tag {
      font-size: 0.6rem; letter-spacing: 0.12em;
      font-family: 'Cinzel', serif; padding: 2px 8px;
    }
    .tag.him-tag { background: rgba(91,155,213,0.12); border: 1px solid rgba(91,155,213,0.25); color: var(--him-light); }
    .tag.her-tag { background: rgba(201,123,138,0.12); border: 1px solid rgba(201,123,138,0.25); color: var(--her-light); }
    .tag.union-tag { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); color: var(--union-light); }
    .tag.gold-tag { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); color: var(--union-light); }

    .insight-body {
      padding: 18px 24px; background: var(--surface);
      border: 1px solid rgba(201,168,76,0.1);
      border-left: none; border-top: 1px solid rgba(255,255,255,0.04);
    }
    .insight-body p {
      font-size: 0.92rem; color: var(--text-body);
      line-height: 1.95; margin-bottom: 12px;
    }
    .insight-body p:last-child { margin-bottom: 0; }
  `;
}

export function getBlockCSS(): string {
  return `
    .quote-box {
      padding: 14px 18px; margin: 14px 0;
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 1.05rem; line-height: 1.85;
    }
    .quote-box.him-q   { background: rgba(91,155,213,0.06); border-left: 2px solid var(--him-dim); color: var(--him-light); }
    .quote-box.her-q   { background: rgba(201,123,138,0.06); border-left: 2px solid var(--her-dim); color: var(--her-light); }
    .quote-box.union-q { background: rgba(201,168,76,0.06); border-left: 2px solid var(--union-dim); color: var(--union-light); }
    .quote-box.gold-q  { background: rgba(201,168,76,0.06); border-left: 2px solid var(--union-dim); color: var(--union-light); }

    .split-box { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
    .split-him { background: rgba(91,155,213,0.05); border: 1px solid rgba(91,155,213,0.2); padding: 14px; }
    .split-her { background: rgba(201,123,138,0.05); border: 1px solid rgba(201,123,138,0.2); padding: 14px; }
    .split-label { font-family: 'Cinzel', serif; font-size: 0.6rem; letter-spacing: 0.2em; margin-bottom: 6px; }
    .split-label.him-l { color: var(--him-light); }
    .split-label.her-l { color: var(--her-light); }
    .split-text { font-size: 0.83rem; color: #A8A090; line-height: 1.7; }

    .dot-item {
      display: flex; gap: 10px; align-items: flex-start;
      margin-bottom: 9px; font-size: 0.88rem; color: #A8A090; line-height: 1.7;
    }
    .dot-item::before { content: '◆'; font-size: 0.5rem; margin-top: 6px; flex-shrink: 0; }
    .dot-him::before   { color: var(--him-dim); }
    .dot-her::before   { color: var(--her-dim); }
    .dot-union::before { color: var(--union-dim); }
    .dot-gold::before  { color: var(--union-dim); }
  `;
}

export function getScoreCSS(): string {
  return `
    .score-section {
      background: var(--surface); border: 1px solid rgba(201,168,76,0.2);
      padding: 35px; margin: 50px 0; text-align: center;
    }
    .score-title {
      font-family: 'Cinzel', serif; font-size: 0.7rem;
      letter-spacing: 0.3em; color: var(--union); margin-bottom: 25px;
    }
    .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
    .score-item { text-align: center; }
    .score-label {
      font-family: 'Cinzel', serif; font-size: 0.6rem;
      letter-spacing: 0.15em; color: var(--text-dim); margin-bottom: 6px; display: block;
    }
    .score-bar { height: 4px; background: rgba(255,255,255,0.08); margin: 8px auto; max-width: 80px; position: relative; }
    .score-fill { position: absolute; left: 0; top: 0; bottom: 0; }
    .score-num { font-family: 'Cinzel', serif; font-size: 1.8rem; line-height: 1; }
  `;
}

export function getSynthesisCSS(): string {
  return `
    .synthesis {
      background: linear-gradient(135deg, rgba(91,155,213,0.08), rgba(201,123,138,0.08));
      border: 1px solid rgba(201,168,76,0.25); padding: 42px;
      margin-top: 50px; text-align: center; position: relative; overflow: hidden;
    }
    .synthesis::before {
      content: '∞'; position: absolute; font-size: 12rem;
      color: rgba(201,168,76,0.04); top: 50%; left: 50%;
      transform: translate(-50%, -50%); font-family: serif; pointer-events: none;
    }
    .synthesis.personal-synth { background: linear-gradient(135deg, rgba(201,168,76,0.06), rgba(124,92,191,0.06)); }
    .synthesis.family-synth   { background: linear-gradient(135deg, rgba(201,168,76,0.08), rgba(126,200,164,0.06)); }
    .synthesis h2 {
      font-family: 'Cinzel', serif; color: var(--union-light);
      font-size: 1.1rem; letter-spacing: 0.2em; margin-bottom: 22px; position: relative;
    }
    .synthesis p {
      font-family: 'Cormorant Garamond', serif; font-size: 1.15rem;
      line-height: 2.1; color: var(--text); max-width: 700px;
      margin: 0 auto; position: relative;
    }
  `;
}

export function getFooterCSS(): string {
  return `
    .footer {
      text-align: center; margin-top: 55px; padding-top: 26px;
      border-top: 1px solid rgba(201,168,76,0.12);
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      color: var(--text-dim); font-size: 0.86rem;
    }
  `;
}

export function getNumberCardCSS(): string {
  return `
    .numbers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 2rem 0; }
    @media (max-width: 600px) { .numbers-grid { grid-template-columns: repeat(2, 1fr); } }
    .number-card {
      background: var(--surface); border: 1px solid var(--union-dim);
      border-radius: 10px; padding: 1.2rem 1rem; text-align: center;
      position: relative; overflow: hidden;
    }
    .number-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0;
      height: 2px; background: var(--accent-color, var(--union));
    }
    .number-card.master {
      border-color: var(--union);
      background: linear-gradient(135deg, var(--surface), #1f1a30);
    }
    .number-card .card-label { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 0.5rem; }
    .number-card .card-number { font-family: 'Cinzel', serif; font-size: 2.2rem; font-weight: 700; color: var(--accent-color, var(--union-light)); line-height: 1; margin-bottom: 0.3rem; }
    .number-card .card-symbol { font-size: 1rem; color: var(--text-dim); }
    .number-card .card-name { font-size: 0.7rem; letter-spacing: 0.1em; color: var(--text-dim); margin-top: 0.25rem; }
    .master-badge, .special-badge {
      display: inline-block; font-size: 0.5rem; letter-spacing: 0.08em;
      padding: 0.1rem 0.4rem; border-radius: 20px; margin-top: 0.25rem;
    }
    .master-badge  { background: rgba(201,168,76,0.15); color: var(--union-light); border: 1px solid var(--union-dim); }
    .special-badge { background: rgba(144,202,249,0.1); color: #90caf9; border: 1px solid #4a7a9e; }
  `;
}

export function getResponsiveCSS(): string {
  return `
    @media (max-width: 600px) {
      .names-row { grid-template-columns: 1fr; }
      .person-card.him { border-right: 1px solid rgba(91,155,213,0.25); border-bottom: none; }
      .person-card.her { border-left: 1px solid rgba(201,123,138,0.25); border-top: none; }
      .union-center { width: 100%; height: 45px; }
      .split-box { grid-template-columns: 1fr; }
      .score-grid { grid-template-columns: repeat(2, 1fr); }
      .synthesis { padding: 25px; }
      h1 { font-size: 1.4rem; }
      .members-maps-grid { grid-template-columns: 1fr; }
    }
    @media print {
      body { background: #fff; color: #111; }
      body::before { display: none; }
      .number-card, .synthesis, .insight-card { border-color: #ccc; }
      h1, .section-title { color: #3a2a0a; }
    }
  `;
}
