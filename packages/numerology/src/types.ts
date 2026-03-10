// ─────────────────────────────────────────────────────────────────────────────
// TYPES — @jyotish/numerology
// ─────────────────────────────────────────────────────────────────────────────

/** A number that has been reduced, preserving master numbers (11, 22, 33) */
export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 22 | 33;

/** Letter-to-number calculation system */
export type CalculationSystem = 'pythagorean' | 'chaldean';

/** Input required to calculate a person's full numerology map */
export interface PersonInput {
  /** First name(s) — e.g. "María Fernanda" */
  firstName: string;
  /** Paternal surname (apellido paterno) — e.g. "González" */
  paternalSurname: string;
  /** Maternal surname (apellido materno) — e.g. "Morelos" */
  maternalSurname: string;
  /** Birth date */
  birthDate: {
    day: number;   // 1-31
    month: number; // 1-12
    year: number;  // e.g. 1981
  };
}

/**
 * Build the canonical full name string from a PersonInput.
 * Order: firstName + paternalSurname + maternalSurname
 * This is the string fed into all letter calculations.
 */
export function buildFullName(input: Pick<PersonInput, 'firstName' | 'paternalSurname' | 'maternalSurname'>): string {
  return [input.firstName, input.paternalSurname, input.maternalSurname]
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .join(' ');
}

/** The 5 core numbers + personal year (Jyotish numerology) */
export interface NumerologyMap {
  /** Alma (Psychic Number): birth day reduced */
  soul: NumerologyNumber;
  /** Regalo (Gift Number): last 2 digits of birth year reduced */
  personality: NumerologyNumber;
  /** Karma: sum of consonants in full name */
  karma: NumerologyNumber;
  /** Destino (Destiny / Life Path): sum of full birth date */
  destiny: NumerologyNumber;
  /** Misión (Mission): sum of vowels in full name */
  mission: NumerologyNumber;
  /** Año personal (Personal Year): day + month + calendar year */
  personalYear: NumerologyNumber;
  /** Whether each number is a master number (not reduced) */
  masterNumbers: {
    soul: boolean;
    personality: boolean;
    karma: boolean;
    destiny: boolean;
    mission: boolean;
    personalYear: boolean;
  };
  /** Raw (unreduced) values, useful for display */
  rawValues: {
    soul: number;
    personality: number;
    karma: number;
    destiny: number;
    mission: number;
    personalYear: number;
  };
}

/** Result of a compatibility reading between two people */
export interface CompatibilityNumbers {
  person1: NumerologyMap;
  person2: NumerologyMap;
  /** Key resonances found (e.g. shared numbers, mirrored positions) */
  resonances: Resonance[];
  /** The relationship number: sum of both destinies reduced */
  relationshipNumber: NumerologyNumber;
}

/** A notable numeric resonance between two maps */
export interface Resonance {
  type: 'shared_soul' | 'shared_destiny' | 'mirrored' | 'complementary' | 'master_pair';
  number: number;
  description: string;
  positions: string[];
}

/** Result of a family reading */
export interface FamilyNumbers {
  members: Array<{ name: string; map: NumerologyMap }>;
  /** Family soul number: sum of all destinies reduced */
  familyNumber: NumerologyNumber;
  /** Shared frequencies across 3+ members */
  dominantNumbers: number[];
}
