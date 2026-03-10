// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS — Compatibility & Family readings
// ─────────────────────────────────────────────────────────────────────────────

import type {
  NumerologyMap,
  CompatibilityNumbers,
  FamilyNumbers,
  Resonance,
  NumerologyNumber,
} from './types';
import { reduceNumber } from './utils';

// ── COMPATIBILITY ─────────────────────────────────────────────────────────────

/**
 * Analyze the numeric resonances between two people's maps.
 * Finds shared numbers, mirrored positions and master number pairs.
 */
export function analyzeCompatibility(
  name1: string,
  map1: NumerologyMap,
  name2: string,
  map2: NumerologyMap
): CompatibilityNumbers {
  const resonances: Resonance[] = [];

  // 1. Exact matches in the same position
  const positions: Array<[keyof NumerologyMap, string]> = [
    ['soul',        'Alma'],
    ['personality', 'Regalo'],
    ['karma',       'Karma'],
    ['destiny',     'Destino'],
    ['mission',     'Misión'],
  ];

  for (const [key, label] of positions) {
    const v1 = map1[key] as number;
    const v2 = map2[key] as number;
    if (v1 === v2) {
      resonances.push({
        type: 'shared_soul',
        number: v1,
        description: `Ambos tienen el ${v1} en ${label} — vibran en la misma frecuencia en esta dimensión`,
        positions: [`${name1} · ${label}`, `${name2} · ${label}`],
      });
    }
  }

  // 2. Mirrored: one person's soul matches the other's destiny (and vice versa)
  if (map1.soul === map2.destiny) {
    resonances.push({
      type: 'mirrored',
      number: map1.soul,
      description: `El Alma de ${name1} (${map1.soul}) es el Destino de ${name2} — lo que uno siente, el otro lo encarna como camino`,
      positions: [`${name1} · Alma`, `${name2} · Destino`],
    });
  }
  if (map2.soul === map1.destiny) {
    resonances.push({
      type: 'mirrored',
      number: map2.soul,
      description: `El Alma de ${name2} (${map2.soul}) es el Destino de ${name1} — lo que uno siente, el otro lo encarna como camino`,
      positions: [`${name2} · Alma`, `${name1} · Destino`],
    });
  }

  // 3. Master number pair — both have a master number anywhere
  const masterNums1 = Object.entries(map1.masterNumbers)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const masterNums2 = Object.entries(map2.masterNumbers)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (masterNums1.length > 0 && masterNums2.length > 0) {
    resonances.push({
      type: 'master_pair',
      number: 11,
      description: `Ambas personas cargan números maestros — esta es una unión de almas con un propósito elevado`,
      positions: [
        ...masterNums1.map(k => `${name1} · ${k}`),
        ...masterNums2.map(k => `${name2} · ${k}`),
      ],
    });
  }

  // 4. Complementary: numbers that sum to 9 or 11 (completion/mastery)
  const allNums1 = [map1.soul, map1.personality, map1.karma, map1.destiny, map1.mission];
  const allNums2 = [map2.soul, map2.personality, map2.karma, map2.destiny, map2.mission];
  const complementaryPairs: Array<[number, number]> = [];

  for (const n1 of allNums1) {
    for (const n2 of allNums2) {
      if (n1 + n2 === 9 || n1 + n2 === 11) {
        if (!complementaryPairs.find(([a, b]) => a === n1 && b === n2)) {
          complementaryPairs.push([n1, n2]);
        }
      }
    }
  }

  if (complementaryPairs.length >= 2) {
    resonances.push({
      type: 'complementary',
      number: 9,
      description: `Sus números se complementan frecuentemente (suman 9 o 11) — se completan el uno al otro`,
      positions: complementaryPairs.slice(0, 3).map(([a, b]) => `${a} + ${b}`),
    });
  }

  // Relationship number
  const rawRelationship = map1.destiny + map2.destiny;
  const relationshipNumber = reduceNumber(rawRelationship);

  return { person1: map1, person2: map2, resonances, relationshipNumber };
}

// ── FAMILY ────────────────────────────────────────────────────────────────────

/**
 * Analyze the collective numerology of a family unit.
 * Family number = sum of all destinies, reduced.
 */
export function analyzeFamilyUnit(
  members: Array<{ name: string; map: NumerologyMap }>
): FamilyNumbers {
  // Family number: sum of all destiny numbers
  const destinySum = members.reduce((acc, m) => acc + m.map.destiny, 0);
  const familyNumber = reduceNumber(destinySum);

  // Find dominant numbers (appear in 3+ positions across all members)
  const allNumbers: number[] = [];
  for (const { map } of members) {
    allNumbers.push(map.soul, map.personality, map.karma, map.destiny, map.mission);
  }

  const frequency: Record<number, number> = {};
  for (const n of allNumbers) {
    frequency[n] = (frequency[n] ?? 0) + 1;
  }

  // Numbers that appear 3 or more times across the family
  const dominantNumbers = Object.entries(frequency)
    .filter(([, count]) => count >= 3)
    .sort(([, a], [, b]) => b - a)
    .map(([num]) => parseInt(num));

  return { members, familyNumber, dominantNumbers };
}

// ── PERSONAL YEAR DESCRIPTION ─────────────────────────────────────────────────

/**
 * Returns a concise (free tier) description of a personal year number.
 * Used as the "summary" shown to non-premium users.
 */
export function personalYearSummary(year: NumerologyNumber): string {
  const summaries: Record<number, string> = {
    1:  'Año de nuevos comienzos. Es tiempo de plantar semillas, tomar iniciativa y establecer tu dirección.',
    2:  'Año de relaciones y cooperación. Los vínculos y la paciencia son tu mayor fortaleza.',
    3:  'Año de expresión y creatividad. Tu voz, tu arte y tu alegría son el camino.',
    4:  'Año de construcción y disciplina. Pon los cimientos sólidos de lo que quieres durar.',
    5:  'Año de cambio y libertad. Suelta lo que ya no te sirve y abraza el movimiento.',
    6:  'Año del hogar y la responsabilidad. El amor y el servicio a quienes amas es tu prioridad.',
    7:  'Año de introspección y espiritualidad. La sabiduría viene del silencio y la reflexión.',
    8:  'Año de poder y abundancia. Tus esfuerzos pasados se materializan — es tiempo de cosechar.',
    9:  'Año de cierre y completud. Termina ciclos con gratitud para liberar espacio a lo nuevo.',
    10: 'Año de transformación pionera. Un ciclo completo se cierra y uno nuevo, más elevado, comienza.',
    11: 'Año maestro de iluminación. Tu intuición está en su punto más alto — confía en ella.',
    22: 'Año maestro de construcción. Tienes el poder de materializar algo extraordinario.',
    33: 'Año maestro de servicio. Tu presencia es un regalo — compártela con el mundo.',
  };
  return summaries[year] ?? `Año personal ${year}: un tiempo de crecimiento y aprendizaje profundo.`;
}

/**
 * Returns a concise summary for a single numerology number in a given dimension.
 * Used as the free-tier snippet (2-3 lines) shown before the paywall.
 */
export function numberSummary(num: NumerologyNumber, dimension: 'soul' | 'personality' | 'karma' | 'destiny' | 'mission'): string {
  const summaries: Record<string, Record<number, string>> = {
    soul: {
      1:  'Tu alma anhela independencia, liderazgo y ser pionera en su camino.',
      2:  'Tu alma anhela amor, armonía y conexión profunda con otros.',
      3:  'Tu alma anhela expresión, creatividad y alegría compartida.',
      4:  'Tu alma anhela estabilidad, orden y construir algo que dure.',
      5:  'Tu alma anhela libertad, aventura y experiencias que expanden.',
      6:  'Tu alma anhela amor incondicional, hogar y armonía a su alrededor.',
      7:  'Tu alma anhela profundidad, conocimiento espiritual y soledad reflexiva.',
      8:  'Tu alma anhela poder, abundancia y reconocimiento de su capacidad.',
      9:  'Tu alma anhela sabiduría, compasión y servicio al mundo.',
      10: 'Tu alma anhela completud y un nuevo comienzo desde la madurez.',
      11: 'Tu alma anhela iluminación, inspirar a otros y ser un canal de luz. (Número maestro)',
      22: 'Tu alma anhela construir algo extraordinario que trascienda lo personal. (Número maestro)',
      33: 'Tu alma anhela el servicio puro y el amor incondicional a la humanidad. (Número maestro)',
    },
    personality: {
      1:  'El mundo te percibe como líder, pionero e independiente.',
      2:  'El mundo te percibe como empático, armonioso y diplomático.',
      3:  'El mundo te percibe como creativo, alegre y magnético.',
      4:  'El mundo te percibe como confiable, disciplinado y sólido.',
      5:  'El mundo te percibe como dinámico, libre e impredecible (en el buen sentido).',
      6:  'El mundo te percibe como cálido, nutritivo y naturalmente terapéutico.',
      7:  'El mundo te percibe como misterioso, profundo e inusualmente sabio.',
      8:  'El mundo te percibe como poderoso, ambicioso y capaz.',
      9:  'El mundo te percibe como compasivo, generoso y con sabiduría antigua.',
      10: 'El mundo te percibe como alguien que completa ciclos y abre horizontes.',
      11: 'El mundo te percibe como inspirador, sensible e intuitivo. (Número maestro)',
      22: 'El mundo te percibe como alguien con visión y capacidad de construir lo imposible. (Número maestro)',
      33: 'El mundo te percibe como una presencia sanadora y amorosa. (Número maestro)',
    },
    karma: {
      1:  'Tu lección de vida: desarrollar independencia sin caer en el egocentrismo.',
      2:  'Tu lección de vida: aprender a recibir tanto como das, y a poner límites.',
      3:  'Tu lección de vida: expresarte sin miedo al juicio y sin dispersarte.',
      4:  'Tu lección de vida: construir disciplina sin rigidez excesiva.',
      5:  'Tu lección de vida: encontrar libertad dentro del compromiso.',
      6:  'Tu lección de vida: amarte a ti mismo con la misma generosidad que amas a otros.',
      7:  'Tu lección de vida: aprender a confiar y abrirte a la fe experiencial.',
      8:  'Tu lección de vida: usar el poder con responsabilidad y sin apego.',
      9:  'Tu lección de vida: soltar los ciclos cuando terminan y dar sin esperar retorno.',
      10: 'Tu lección de vida: completar lo que empiezas y liderar con madurez.',
      11: 'Tu lección de vida: confiar en tu intuición maestra sin buscar validación externa.',
      22: 'Tu lección de vida: materializar tu visión grande sin rendirte ante los obstáculos.',
      33: 'Tu lección de vida: servir desde la abundancia, no desde el sacrificio.',
    },
    destiny: {
      1:  'Tu camino de vida es el del pionero — liderar e iniciar lo que otros continuarán.',
      2:  'Tu camino de vida es el de la cooperación — crear puentes y armonía entre personas.',
      3:  'Tu camino de vida es el de la expresión — tu voz, arte o creatividad es tu legado.',
      4:  'Tu camino de vida es el del constructor — crear estructuras que perduren.',
      5:  'Tu camino de vida es el de la exploración — aprender a través de la experiencia directa.',
      6:  'Tu camino de vida es el del cuidado — nutrir, sanar y crear belleza.',
      7:  'Tu camino de vida es el del buscador — encontrar la verdad a través de la profundidad.',
      8:  'Tu camino de vida es el del poder consciente — construir abundancia y dejar legado.',
      9:  'Tu camino de vida es el del sabio humanitario — dar sin condiciones y completar ciclos.',
      10: 'Tu camino de vida es el del renovador — cerrar eras y abrir horizontes completamente nuevos.',
      11: 'Tu camino de vida es el del maestro espiritual — inspirar a otros con tu propio camino. (Número maestro)',
      22: 'Tu camino de vida es el del arquitecto del mundo — construir algo que transforme a muchos. (Número maestro)',
      33: 'Tu camino de vida es el del maestro del amor — sanar con tu sola presencia. (Número maestro)',
    },
    mission: {
      1:  'Tu misión: ser pionero y mostrar al mundo que se puede empezar de cero con valentía.',
      2:  'Tu misión: construir paz y conexión auténtica entre las personas.',
      3:  'Tu misión: llevar luz, alegría y esperanza a través de la expresión creativa.',
      4:  'Tu misión: demostrar que la constancia y la integridad construyen cosas que perduran.',
      5:  'Tu misión: ser agente de cambio y demostrar que la libertad es posible.',
      6:  'Tu misión: crear hogares, comunidades y vínculos donde todos se sientan amados.',
      7:  'Tu misión: buscar y compartir la verdad más profunda que puedas encontrar.',
      8:  'Tu misión: construir abundancia real y compartirla con generosidad.',
      9:  'Tu misión: servir a la humanidad desde la sabiduría que ganaste viviendo.',
      10: 'Tu misión: ser el que llega primero a donde nadie ha llegado y señala el siguiente paso.',
      11: 'Tu misión: iluminar el camino de otros con tu propia transformación. (Número maestro)',
      22: 'Tu misión: materializar una visión que beneficie a muchas generaciones. (Número maestro)',
      33: 'Tu misión: ser un canal de amor incondicional para el mundo. (Número maestro)',
    },
  };
  return summaries[dimension]?.[num] ?? `Número ${num} en ${dimension}: una energía poderosa a explorar.`;
}
