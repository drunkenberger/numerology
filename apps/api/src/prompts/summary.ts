// ─────────────────────────────────────────────────────────────────────────────
// PROMPTS — Summary rápido (resumen de mapa numerológico personal)
// Genera un JSON compacto (~1200 tokens) con lo esencial del mapa.
// ─────────────────────────────────────────────────────────────────────────────

import type { MemberNumbers, Interpretation } from '../types';
import { getSystemPrompt } from './reading';
import { buildPythagoreanSummaryPrompt } from './pythagorean';

export { getSystemPrompt };

interface SummaryPromptInput {
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  numbers: MemberNumbers;
}

export function buildSummaryPrompt(input: SummaryPromptInput): string {
  const { firstName, paternalSurname, maternalSurname, numbers } = input;
  const fullName = `${firstName} ${paternalSurname} ${maternalSurname}`;

  const masterTag = (n: number) =>
    n === 11 || n === 22 || n === 33 ? ' MAESTRO' : n === 10 ? ' ESPECIAL' : '';

  return `Genera un RESUMEN BREVE del mapa numerológico Jyotish para:

NOMBRE: ${fullName}
NÚMEROS:
- Alma (número psíquico, día de nacimiento): ${numbers.soul}${masterTag(numbers.soul)}
- Destino (dharma, fecha completa): ${numbers.destiny}${masterTag(numbers.destiny)}
- Misión (vocales del nombre): ${numbers.mission}${masterTag(numbers.mission)}
- Año Personal (ciclo cósmico actual): ${numbers.personalYear}${masterTag(numbers.personalYear)}

INSTRUCCIONES:
- Interpreta desde el marco Jyotish: karma, dharma, evolución del alma
- Sé conciso pero profundo. Cada campo debe ser una joya breve.
- Máximo 1200 tokens en total.

Responde ÚNICAMENTE con este JSON (sin bloques de código):
{
  "intro": "2-3 oraciones capturando la esencia Jyotish del mapa de ${firstName}. Menciona si hay números maestros.",
  "highlights": [
    { "key": "soul", "number": ${numbers.soul}, "title": "Alma", "insight": "1-2 oraciones sobre la esencia con la que nació — su vibración psíquica innata." },
    { "key": "destiny", "number": ${numbers.destiny}, "title": "Destino", "insight": "1-2 oraciones sobre su dharma — el camino que su alma eligió." },
    { "key": "mission", "number": ${numbers.mission}, "title": "Misión", "insight": "1-2 oraciones sobre el propósito sagrado que debe expresar en el mundo." }
  ],
  "currentYear": "1-2 oraciones sobre el Año Personal ${numbers.personalYear} y qué enseñanzas kármicas trae este ciclo cósmico.",
  "keyTheme": "1 oración poderosa que resuma el dharma y la evolución del alma de ${firstName}."
}`;
}

export function buildSummaryPromptForInterpretation(
  interpretation: Interpretation,
  input: SummaryPromptInput,
): string {
  return interpretation === 'pythagorean'
    ? buildPythagoreanSummaryPrompt(input)
    : buildSummaryPrompt(input);
}
