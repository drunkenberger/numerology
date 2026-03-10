// ─────────────────────────────────────────────────────────────────────────────
// INDEX — Public API for @jyotish/numerology
// ─────────────────────────────────────────────────────────────────────────────

// Types
export type {
  NumerologyNumber,
  CalculationSystem,
  PersonInput,
  NumerologyMap,
  CompatibilityNumbers,
  FamilyNumbers,
  Resonance,
} from './types';

export { buildFullName } from './types';

// Core calculation
export {
  calculateMap,
  calculateVowels,
  calculateConsonants,
  calculateAlma,
  calculateGift,
  calculateDestiny,
  calculateAllLetters,
  calculatePersonalYear,
} from './calculator';

// Backward-compatible aliases
export {
  calculateVowels as calculateSoul,
  calculateConsonants as calculatePersonality,
  calculateAlma as calculateKarma,
  calculateAllLetters as calculateMission,
} from './calculator';

// Analysis
export {
  analyzeCompatibility,
  analyzeFamilyUnit,
  personalYearSummary,
  numberSummary,
} from './analysis';

// Utils (for advanced use / testing)
export {
  normalizeName,
  reduceNumber,
  letterValue,
  isVowel,
  isMasterNumber,
  digitSum,
} from './utils';
