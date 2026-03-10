// ─────────────────────────────────────────────────────────────────────────────
// UTILS — Pythagorean table, reduction, normalization
// ─────────────────────────────────────────────────────────────────────────────

import type { NumerologyNumber, CalculationSystem } from './types';

/**
 * Pythagorean letter-to-number table (A=1 ... Z=8)
 * Sequential 1-9 cycle: A=1, B=2... I=9, J=1, K=2...
 */
const PYTHAGOREAN_TABLE: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

/**
 * Chaldean letter-to-number table (used in Hindu/Jyotish numerology)
 * 9 is sacred and NEVER assigned to any letter.
 * 1=A,I,J,Q,Y  2=B,K,R  3=C,G,L,S  4=D,M,T  5=E,H,N,X
 * 6=U,V,W  7=O,Z  8=F,P
 */
const CHALDEAN_TABLE: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

/**
 * Normalize a string: uppercase, remove accents, keep only A-Z and spaces.
 * Handles Spanish: á→A, é→E, í→I, ó→O, ú→U, ü→U, ñ→N
 */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')                     // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')      // strip combining diacriticals
    .toUpperCase()
    .replace(/[-_]/g, ' ')               // hyphens/underscores → spaces
    .replace(/[^A-Z\s]/g, '')            // keep only letters and spaces
    .replace(/\s+/g, ' ')               // collapse multiple spaces
    .trim();
}

/** Get the numeric value of a single letter (already normalized uppercase A-Z) */
export function letterValue(letter: string, system: CalculationSystem = 'pythagorean'): number {
  const table = system === 'chaldean' ? CHALDEAN_TABLE : PYTHAGOREAN_TABLE;
  return table[letter] ?? 0;
}

/** Check if a letter is a vowel */
export function isVowel(letter: string): boolean {
  return VOWELS.has(letter);
}

/**
 * Reduce a number to a single digit, preserving master numbers 11, 22, 33.
 * Examples:
 *   reduceNumber(29) → 11  (master number, not reduced further)
 *   reduceNumber(22) → 22  (master number)
 *   reduceNumber(38) → 11  (3+8=11, master number)
 *   reduceNumber(15) → 6   (1+5=6)
 *   reduceNumber(66) → 12 → 3
 */
export function reduceNumber(n: number): NumerologyNumber {
  // Special numbers that are never reduced further
  if (n === 10 || n === 11 || n === 22 || n === 33) return n as NumerologyNumber;

  let current = n;
  while (current > 9) {
    // Sum the digits
    current = String(current)
      .split('')
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
    // Check special numbers after each reduction step
    if (current === 10 || current === 11 || current === 22 || current === 33) {
      return current as NumerologyNumber;
    }
  }
  return current as NumerologyNumber;
}

/**
 * Sum all digits in a number (for destiny / personal year calculation)
 * This sums digit by digit, not the number itself.
 * e.g. digitSum(1981) → 1+9+8+1 = 19
 */
export function digitSum(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return String(Math.floor(n))
    .split('')
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
}

/**
 * Sum letters in a name string, filtered by a predicate.
 * Handles the name as a single string (spaces ignored).
 */
export function sumLetters(
  normalizedName: string,
  filter: (letter: string) => boolean,
  system: CalculationSystem = 'pythagorean',
): number {
  return normalizedName
    .split('')
    .filter(ch => ch !== ' ' && filter(ch))
    .reduce((acc, ch) => acc + letterValue(ch, system), 0);
}

/** Check if a number is a master number */
export function isMasterNumber(n: number): boolean {
  return n === 11 || n === 22 || n === 33;
}
