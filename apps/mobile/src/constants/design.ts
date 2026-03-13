// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — Jyotish Mobile
// Estética: Astronomía oscura + manuscrito antiguo + cosmos dorado
// Fuentes: Cinzel (display) + Lato Light (cuerpo) — cargadas vía expo-font
// ─────────────────────────────────────────────────────────────────────────────

export const COLORS = {
  // ── Fondos ────────────────────────────────────────────────────────────────
  bgDeep:      '#080812',   // negro cosmos — fondo raíz
  bgCard:      '#0f0f24',   // azul noche tarjeta
  bgSection:   '#141430',   // sección interior
  bgElevated:  '#1a1a3a',   // modales / bottom sheets
  bgOverlay:   'rgba(8,8,18,0.85)',

  // ── Acentos ───────────────────────────────────────────────────────────────
  gold:        '#c9a84c',   // dorado principal — acciones primarias
  goldLight:   '#e8c87a',   // dorado claro — textos destacados
  goldDim:     '#5a4820',   // dorado atenuado — bordes
  goldGlow:    'rgba(201,168,76,0.18)', // glow suave

  // ── Violeta (números maestros) ────────────────────────────────────────────
  violet:      '#7c5cbf',
  violetLight: '#b09de8',
  violetGlow:  'rgba(124,92,191,0.2)',

  // ── Texto ─────────────────────────────────────────────────────────────────
  textPrimary:   '#f0e8d8',  // crema cálido
  textSecondary: '#a89880',  // gris dorado
  textMuted:     '#504840',  // muy atenuado
  textInverse:   '#080812',

  // ── UI ────────────────────────────────────────────────────────────────────
  border:      '#2a2448',
  borderGold:  '#3a3018',
  success:     '#6abf9e',
  error:       '#e07070',
  warning:     '#d4a04a',

  // ── Acento por número ─────────────────────────────────────────────────────
  n1: '#e8a04a', n2: '#90c4f0', n3: '#f0d060', n4: '#9a7a60',
  n5: '#80c8c0', n6: '#f090b0', n7: '#c090e0', n8: '#b0c0c8',
  n9: '#f08080', n10:'#90c4f0', n11:'#e8c87a', n22:'#b090f0', n33:'#f090b8',
} as const;

export const NUMBER_COLORS: Record<number, string> = {
  1: COLORS.n1,  2: COLORS.n2,  3: COLORS.n3,  4: COLORS.n4,
  5: COLORS.n5,  6: COLORS.n6,  7: COLORS.n7,  8: COLORS.n8,
  9: COLORS.n9,  10:COLORS.n10, 11:COLORS.n11, 22:COLORS.n22, 33:COLORS.n33,
};

export const NUMBER_SYMBOLS: Record<number, string> = {
  1:'☉', 2:'☽', 3:'♃', 4:'♄', 5:'☿', 6:'♀',
  7:'♆', 8:'♄', 9:'♂', 10:'◉', 11:'★', 22:'✦', 33:'✸',
};

export const NUMBER_LABELS: Record<number, string> = {
  1:'Iniciador', 2:'Sensitivo', 3:'Expresivo', 4:'Constructor',
  5:'Libre', 6:'Armonioso', 7:'Místico', 8:'Poderoso',
  9:'Sabio', 10:'Completo', 11:'Iluminado', 22:'Arquitecto', 33:'Maestro del Amor',
};

export function getNumberColor(n: number): string {
  return NUMBER_COLORS[n] ?? COLORS.gold;
}

export function isMaster(n: number): boolean {
  return n === 11 || n === 22 || n === 33;
}
export function isSpecial(n: number): boolean {
  return n === 10;
}

// ── Tipografía ────────────────────────────────────────────────────────────────

export const FONTS = {
  display:      'Cinzel_600SemiBold',
  displayBold:  'Cinzel_700Bold',
  body:         'Lato_300Light',
  bodyRegular:  'Lato_400Regular',
  bodyBold:     'Lato_700Bold',
} as const;

export const FONT_SIZE = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  32,
  hero: 42,
} as const;

// ── Espaciado ─────────────────────────────────────────────────────────────────

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
  xxxl:48,
} as const;

// ── Bordes ────────────────────────────────────────────────────────────────────

export const RADIUS = {
  sm:  6,
  md:  10,
  lg:  16,
  xl:  24,
  full:9999,
} as const;

// ── Sombras ───────────────────────────────────────────────────────────────────

export const SHADOWS = {
  gold: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  violet: {
    shadowColor: COLORS.violet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;
