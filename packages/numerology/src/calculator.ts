// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR — Hindu/Pythagorean numerology engine
// ─────────────────────────────────────────────────────────────────────────────

import type { PersonInput, NumerologyMap, NumerologyNumber, CalculationSystem } from './types';
import { buildFullName } from './types';
import {
  normalizeName,
  isVowel,
  sumLetters,
  digitSum,
  reduceNumber,
  isMasterNumber,
  letterValue,
} from './utils';

// ── VOWELS (used for Misión in Jyotish) ──────────────────────────────────────

/**
 * Sum of all VOWELS in the full name → Misión in Jyotish numerology.
 */
export function calculateVowels(fullName: string, system: CalculationSystem = 'pythagorean'): { raw: number; reduced: NumerologyNumber } {
  const normalized = normalizeName(fullName);
  const raw = sumLetters(normalized, isVowel, system);
  return { raw, reduced: reduceNumber(raw) };
}

// ── CONSONANTS (used for Karma in Jyotish) ───────────────────────────────────

/**
 * Sum of all CONSONANTS in the full name → Karma in Jyotish numerology.
 */
export function calculateConsonants(fullName: string, system: CalculationSystem = 'pythagorean'): { raw: number; reduced: NumerologyNumber } {
  const normalized = normalizeName(fullName);
  const raw = sumLetters(normalized, ch => !isVowel(ch), system);
  return { raw, reduced: reduceNumber(raw) };
}

// ── ALMA (Soul / Psychic Number) ─────────────────────────────────────────────

/**
 * Alma = birth DAY, reduced (preserving master numbers).
 * In Jyotish numerology, the psychic number reveals the inner self.
 * Day 29 → 2+9=11 (master number, preserved)
 * Day 24 → 2+4=6
 */
export function calculateAlma(day: number): { raw: number; reduced: NumerologyNumber } {
  const raw = day;
  return { raw, reduced: reduceNumber(raw) };
}

// ── REGALO (Gift Number) ─────────────────────────────────────────────────────

/**
 * Regalo = last two digits of birth YEAR, reduced.
 * "The innate gift you carry into this life."
 * 1981 → 81 → 8+1=9
 * 2020 → 20 → 2+0=2
 */
export function calculateGift(year: number): { raw: number; reduced: NumerologyNumber } {
  const lastTwo = year % 100;
  return { raw: lastTwo, reduced: reduceNumber(lastTwo) };
}

// ── DESTINY NUMBER (Destino / Life Path) ─────────────────────────────────────

/**
 * Destiny = sum of ALL digits in the full birth date (day + month + year).
 * Each component is summed digit-by-digit.
 * e.g. 29/07/1981 → 2+9+0+7+1+9+8+1 = 37 → 3+7=10 → 1+0=1... but 10 is preserved
 *
 * Note: In Hindu numerology, 10 is kept as-is (not reduced to 1).
 * It represents completion + new beginning.
 */
export function calculateDestiny(day: number, month: number, year: number): { raw: number; reduced: NumerologyNumber } {
  const dayDigits   = digitSum(day);
  const monthDigits = digitSum(month);
  const yearDigits  = digitSum(year);
  const raw = dayDigits + monthDigits + yearDigits;

  // Special Hindu numerology rule: 10 is not reduced (cycle completion)
  if (raw === 10) return { raw, reduced: 10 as NumerologyNumber };

  return { raw, reduced: reduceNumber(raw) };
}

// ── ALL LETTERS (sum of full name — not directly mapped in Jyotish) ──────────

/**
 * Sum of ALL letters (vowels + consonants) in the full name.
 * Kept for compatibility; not directly assigned to a Jyotish label.
 */
export function calculateAllLetters(fullName: string, system: CalculationSystem = 'pythagorean'): { raw: number; reduced: NumerologyNumber } {
  const normalized = normalizeName(fullName);
  const raw = normalized
    .split('')
    .filter(ch => ch !== ' ')
    .reduce((acc, ch) => acc + letterValue(ch, system), 0);
  return { raw, reduced: reduceNumber(raw) };
}

// ── PERSONAL YEAR ─────────────────────────────────────────────────────────────

/**
 * Personal Year = digitSum(birth day) + digitSum(birth month) + digitSum(calendar year).
 *
 * In Jyotish numerology, the personal year uses the current CALENDAR year,
 * not a "cycle year" based on the last birthday.
 *
 * e.g. Person born July 29, reference date March 7 2026:
 *   Personal year = digitSum(29) + digitSum(7) + digitSum(2026) = 11+7+10 = 28 → 10
 */
export function calculatePersonalYear(
  day: number,
  month: number,
  referenceDate: Date
): { raw: number; reduced: NumerologyNumber; cycleYear: number } {
  const calendarYear = referenceDate.getUTCFullYear();
  const raw = digitSum(day) + digitSum(month) + digitSum(calendarYear);

  if (raw === 10) return { raw, reduced: 10 as NumerologyNumber, cycleYear: calendarYear };

  return { raw, reduced: reduceNumber(raw), cycleYear: calendarYear };
}

// ── FULL MAP CALCULATOR ───────────────────────────────────────────────────────

/**
 * Calculate the complete NumerologyMap for a person.
 * This is the main function that the app and API will use.
 *
 * @param input  Person's name and birth date
 * @param referenceDate  The date to use for personal year calculation (default: today)
 */
export function calculateMap(
  input: PersonInput,
  referenceDate: Date = new Date(),
  system: CalculationSystem = 'pythagorean',
): NumerologyMap {
  const { birthDate } = input;
  const { day, month, year } = birthDate;

  // Build canonical full name from structured fields
  const fullName = buildFullName(input);

  // ── Mapping ───────────────────────────────────────────────────────────────
  // Alma      = birth day (psychic number)         ← date-based, same in both
  // Regalo    = last 2 digits of birth year        ← date-based, same in both
  // Karma     = consonants of full name            ← letter-based, uses system table
  // Destino   = full birth date reduced            ← date-based, same in both
  // Misión    = vowels of full name                ← letter-based, uses system table
  // Año Pers. = day + month + calendar year        ← date-based, same in both
  const alma       = calculateAlma(day);
  const regalo     = calculateGift(year);
  const karma      = calculateConsonants(fullName, system);
  const destiny    = calculateDestiny(day, month, year);
  const mision     = calculateVowels(fullName, system);
  const personalYr = calculatePersonalYear(day, month, referenceDate);

  return {
    soul:        alma.reduced,
    personality: regalo.reduced,
    karma:       karma.reduced,
    destiny:     destiny.reduced,
    mission:     mision.reduced,
    personalYear: personalYr.reduced,
    masterNumbers: {
      soul:        isMasterNumber(alma.reduced),
      personality: isMasterNumber(regalo.reduced),
      karma:       isMasterNumber(karma.reduced),
      destiny:     isMasterNumber(destiny.reduced),
      mission:     isMasterNumber(mision.reduced),
      personalYear: isMasterNumber(personalYr.reduced),
    },
    rawValues: {
      soul:        alma.raw,
      personality: regalo.raw,
      karma:       karma.raw,
      destiny:     destiny.raw,
      mission:     mision.raw,
      personalYear: personalYr.raw,
    },
  };
}
