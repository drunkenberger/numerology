// ─────────────────────────────────────────────────────────────────────────────
// PROMPTS — Sistema de numerología Pitagórica (occidental) para Claude
// Mismo formato JSON de salida que el hindú, diferente marco interpretativo.
// ─────────────────────────────────────────────────────────────────────────────

import type { MemberNumbers } from '../types';
import type { FamilyMemberInput } from './reading';

// ── System prompt pitagórico ────────────────────────────────────────────────

export const PYTHAGOREAN_SYSTEM_PROMPT = `Eres un maestro de numerología Pitagórica con décadas de experiencia. Tu tarea es generar lecturas numerológicas profundas, narrativas y personalizadas en español, interpretadas desde el marco vibracional y práctico de la tradición occidental pitagórica.

SISTEMA NUMÉRICO PITAGÓRICO QUE USAS:
- Tabla Caldea para valores de letras: A=1 B=2 C=3 D=4 E=5 F=8 G=3 H=5 I=1 J=1 K=2 L=3 M=4 N=5 O=7 P=8 Q=1 R=2 S=3 T=4 U=6 V=6 W=6 X=5 Y=1 Z=7 (el 9 es sagrado y no se asigna a ninguna letra)
- Número del Alma (día de nacimiento reducido): tu vibración interna más profunda, la frecuencia con la que naturalmente operas
- Expresión (últimos 2 dígitos del año reducidos): cómo te expresas en el mundo, tus talentos naturales y la imagen que proyectas
- Desafío (consonantes del nombre): las lecciones de vida que debes superar, los obstáculos que te fortalecen
- Camino de Vida (fecha completa reducida): la ruta principal de tu existencia, el sendero que recorres
- Deseo del Corazón (vocales del nombre): lo que realmente anhelas en lo más profundo, tu motivación secreta
- Año Personal: día + mes de nacimiento + año calendario actual — el ciclo anual y sus oportunidades

MARCO INTERPRETATIVO PITAGÓRICO:
- Interpreta desde las vibraciones numéricas y su influencia práctica en la vida cotidiana
- El Número del Alma es tu frecuencia base — define cómo percibes el mundo y reaccionas instintivamente
- La Expresión es tu potencial visible — los talentos y habilidades que otros reconocen en ti
- El Desafío son los obstáculos recurrentes que, al superarlos, te transforman en una versión más fuerte
- El Camino de Vida es tu sendero principal — las experiencias que la vida te presenta para crecer
- El Deseo del Corazón es tu brújula interior — lo que te mueve cuando nadie está mirando
- El Año Personal marca las oportunidades y temas dominantes del ciclo actual

REGLAS CRÍTICAS:
- Los números maestros 11, 22, 33 NUNCA se reducen — son frecuencias elevadas con potencial excepcional
- El número 10 NUNCA se reduce — representa completud y nuevo comienzo
- El 11 es la intuición amplificada, sensibilidad extrema y visión
- El 22 es el constructor maestro, capaz de materializar grandes visiones
- El 33 es el maestro sanador, compasión y servicio elevado

ESTILO DE RESPUESTA:
- Escribe en español con calidez, profundidad y precisión
- Usa metáforas prácticas y accesibles que conecten con la vida cotidiana
- Sé específico con los números — no genérico
- Integra los números entre sí: muestra cómo se relacionan, qué tensiones crean, qué potenciales activan juntos
- Enfócate en lo práctico: qué puede HACER la persona con esta información
- Responde ÚNICAMENTE con el JSON solicitado. Sin texto previo, sin bloques de código, sin explicaciones fuera del JSON.`;

// ── Prompt: lectura personal pitagórica ─────────────────────────────────────

interface PersonalReadingInput {
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  numbers: MemberNumbers;
}

export function buildPythagoreanPersonalPrompt(input: PersonalReadingInput): string {
  const { firstName, paternalSurname, maternalSurname, numbers } = input;
  const fullName = `${firstName} ${paternalSurname} ${maternalSurname}`;
  const masterTag = (n: number) =>
    n === 11 || n === 22 || n === 33 ? ' ✨ NÚMERO MAESTRO' : n === 10 ? ' ⭕ NÚMERO ESPECIAL' : '';

  return `Genera la lectura numerológica pitagórica personal completa para:

NOMBRE COMPLETO: ${fullName}
NÚMEROS CALCULADOS:
- Número del Alma (día de nacimiento): ${numbers.soul}${masterTag(numbers.soul)}
- Expresión (últimos 2 dígitos del año): ${numbers.personality}${masterTag(numbers.personality)}
- Desafío (consonantes del nombre): ${numbers.karma}${masterTag(numbers.karma)}
- Camino de Vida (fecha completa): ${numbers.destiny}${masterTag(numbers.destiny)}
- Deseo del Corazón (vocales del nombre): ${numbers.mission}${masterTag(numbers.mission)}
- Año Personal actual: ${numbers.personalYear}${masterTag(numbers.personalYear)}

EXTENSIÓN REQUERIDA:
- Cada sección debe tener los párrafos indicados con 3-4 oraciones cada uno.
- La lectura total debe ser profunda y completa (~3000 tokens).
- Sé específico con los números y sus interacciones.
- Enfócate en consejos prácticos y aplicables.

Responde ÚNICAMENTE con este JSON (sin bloques de código):
{
  "intro": "Párrafo de bienvenida de 3-4 oraciones que nombra a la persona y captura la esencia de su mapa vibracional. Menciona si hay números maestros.",
  "soul": "2 párrafos sobre el Número del Alma ${numbers.soul}. Vibración interna, frecuencia natural, cómo percibe el mundo.",
  "personality": "2 párrafos sobre la Expresión ${numbers.personality}. Talentos visibles, cómo se proyecta, potencial natural.",
  "karma": "2 párrafos sobre el Desafío ${numbers.karma}. Obstáculos recurrentes, lecciones de vida, cómo superarlos.",
  "destiny": "2 párrafos sobre el Camino de Vida ${numbers.destiny}. Sendero principal, experiencias clave, dirección.",
  "mission": "2 párrafos sobre el Deseo del Corazón ${numbers.mission}. Motivación profunda, anhelo interior, propósito.",
  "personalYear": "1-2 párrafos sobre el Año Personal ${numbers.personalYear}. Oportunidades, temas dominantes, consejos prácticos.",
  "synthesis": "2-3 párrafos integrando TODOS los números. Interacciones, tensiones, potencial combinado, mensaje central.",
  "shadow": "1-2 párrafos sobre desafíos y aspectos a trabajar conscientemente."
}`;
}

// ── Prompt: compatibilidad pitagórica ───────────────────────────────────────

interface CompatibilityReadingInput {
  person1: { firstName: string; paternalSurname: string; maternalSurname: string; numbers: MemberNumbers };
  person2: { firstName: string; paternalSurname: string; maternalSurname: string; numbers: MemberNumbers };
  relationshipNumber: number;
}

export function buildPythagoreanCompatibilityPrompt(input: CompatibilityReadingInput): string {
  const { person1, person2, relationshipNumber } = input;
  const name1 = `${person1.firstName} ${person1.paternalSurname}`;
  const name2 = `${person2.firstName} ${person2.paternalSurname}`;

  const fmt = (n: MemberNumbers) =>
    `Alma ${n.soul} · Expresión ${n.personality} · Desafío ${n.karma} · Camino de Vida ${n.destiny} · Deseo del Corazón ${n.mission} · Año Personal ${n.personalYear}`;

  return `Genera la lectura de compatibilidad numerológica pitagórica entre:

PERSONA 1 — ${name1}:
${fmt(person1.numbers)}

PERSONA 2 — ${name2}:
${fmt(person2.numbers)}

NÚMERO DE LA RELACIÓN (suma de caminos de vida): ${relationshipNumber}

Analiza especialmente desde el marco Pitagórico:
- Números compartidos o que se repiten entre ambos mapas — ¿qué frecuencias comparten?
- Números maestros presentes y cómo interactúan en el vínculo
- Alma de uno que coincide con Camino de Vida del otro — ¿hay reconocimiento vibracional?
- Desafíos complementarios o en tensión — ¿se ayudan mutuamente a superar sus obstáculos?
- Expresiones y talentos — ¿se potencian o compiten?
- Años personales actuales y lo que significan para este momento de la relación

Responde ÚNICAMENTE con este JSON (sin bloques de código):
{
  "intro": "2 párrafos presentando la lectura de compatibilidad. Nombra a las dos personas y captura la naturaleza vibracional de este vínculo.",
  "soul": "2 párrafos sobre la dinámica entre sus Almas. ¿Sus frecuencias internas resuenan o generan fricción?",
  "personality": "1-2 párrafos sobre sus Expresiones. ¿Sus talentos se complementan? ¿Cómo pueden potenciarse mutuamente?",
  "karma": "2 párrafos sobre los Desafíos en juego. ¿Se ayudan mutuamente a superar sus obstáculos o los activan?",
  "destiny": "2 párrafos sobre sus Caminos de Vida. ¿Van en la misma dirección? ¿Pueden caminar juntos sin perderse?",
  "mission": "1-2 párrafos sobre si sus Deseos del Corazón se potencian o se contradicen.",
  "personalYear": "1-2 párrafos sobre los ciclos anuales que vive cada uno y cómo afectan al vínculo ahora.",
  "synthesis": "3-4 párrafos de síntesis. El número de la relación ${relationshipNumber} como frecuencia central. ¿Qué comparten? ¿Qué tiene que aprender cada uno del otro? ¿Cuál es el potencial más alto de este vínculo?",
  "shadow": "2 párrafos sobre los patrones de tensión más probables y cómo trabajarlos conscientemente.",
  "compatibility": {
    "resonances": "2 párrafos sobre las resonancias más poderosas — números que se espejean, se complementan.",
    "challenges": "2 párrafos sobre los desafíos específicos de este par de mapas.",
    "potential": "2 párrafos sobre el potencial más elevado de esta unión.",
    "currentMoment": "1-2 párrafos sobre el momento actual y qué oportunidad o desafío trae."
  }
}`;
}

// ── Prompt: lectura familiar pitagórica ─────────────────────────────────────

interface FamilyReadingInput {
  members: FamilyMemberInput[];
  familyNumber: number;
  dominantNumbers: number[];
}

export function buildPythagoreanFamilyPrompt(input: FamilyReadingInput): string {
  const { members, familyNumber, dominantNumbers } = input;

  const membersText = members.map(m => {
    const name = `${m.firstName} ${m.paternalSurname} (${m.relation})`;
    return `${name}: Alma ${m.numbers.soul} · Expresión ${m.numbers.personality} · Desafío ${m.numbers.karma} · Camino de Vida ${m.numbers.destiny} · Deseo del Corazón ${m.numbers.mission} · Año Personal ${m.numbers.personalYear}`;
  }).join('\n');

  return `Genera la lectura numerológica pitagórica de la unidad familiar completa.

INTEGRANTES:
${membersText}

NÚMERO FAMILIAR (suma de caminos de vida reducida): ${familyNumber}
NÚMEROS DOMINANTES (aparecen 3+ veces en el grupo): ${dominantNumbers.join(', ') || 'ninguno especialmente dominante'}

Analiza desde el marco Pitagórico:
- El Número Familiar ${familyNumber} como la frecuencia vibracional colectiva del hogar
- Los números dominantes y qué energías impregnan la dinámica familiar
- Las tensiones entre los mapas individuales
- Los años personales actuales y el momento colectivo

Responde ÚNICAMENTE con este JSON (sin bloques de código):
{
  "intro": "2-3 párrafos presentando la lectura familiar. El Número Familiar ${familyNumber} como eje central.",
  "soul": "2 párrafos sobre la esencia vibracional colectiva de la familia.",
  "personality": "2 párrafos sobre los talentos y expresiones colectivos.",
  "karma": "2 párrafos sobre los desafíos colectivos.",
  "destiny": "2 párrafos sobre el camino de vida familiar.",
  "mission": "2 párrafos sobre el propósito colectivo.",
  "personalYear": "2 párrafos sobre los ciclos anuales actuales.",
  "synthesis": "3-4 párrafos de síntesis profunda.",
  "family": {
    "familyNumber": ${familyNumber},
    "dynamics": "2 párrafos sobre la dinámica relacional del grupo.",
    "strengths": "2 párrafos sobre las fortalezas colectivas.",
    "shadows": "2-3 párrafos sobre los desafíos familiares y patrones grupales a trabajar."
  }
}`;
}

// ── Prompt: rol individual pitagórico ───────────────────────────────────────

export function buildPythagoreanSingleRolePrompt(
  member: FamilyMemberInput,
  familyNumber: number,
): string {
  return `Genera el rol numerológico pitagórico de ${member.firstName} ${member.paternalSurname} (${member.relation}) en su familia.

NÚMEROS DE ${member.firstName.toUpperCase()}:
- Número del Alma: ${member.numbers.soul}
- Expresión: ${member.numbers.personality}
- Desafío: ${member.numbers.karma}
- Camino de Vida: ${member.numbers.destiny}
- Deseo del Corazón: ${member.numbers.mission}
- Año Personal: ${member.numbers.personalYear}

NÚMERO FAMILIAR: ${familyNumber}

Escribe 2 párrafos (5-6 oraciones cada uno) sobre el rol específico de ${member.firstName} en esta familia:
- ¿Qué aporta su Alma ${member.numbers.soul} al grupo?
- ¿Cómo su Camino de Vida ${member.numbers.destiny} y Deseo del Corazón ${member.numbers.mission} definen su función en el hogar?
- ¿Qué talento natural (Expresión ${member.numbers.personality}) trae al núcleo familiar?

Responde ÚNICAMENTE con el texto de los 2 párrafos. Sin JSON, sin formato, solo el texto narrativo.`;
}

// ── Prompt: summary pitagórico ──────────────────────────────────────────────

interface SummaryPromptInput {
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  numbers: MemberNumbers;
}

export function buildPythagoreanSummaryPrompt(input: SummaryPromptInput): string {
  const { firstName, paternalSurname, maternalSurname, numbers } = input;
  const fullName = `${firstName} ${paternalSurname} ${maternalSurname}`;
  const masterTag = (n: number) =>
    n === 11 || n === 22 || n === 33 ? ' MAESTRO' : n === 10 ? ' ESPECIAL' : '';

  return `Genera un RESUMEN BREVE del mapa numerológico Pitagórico para:

NOMBRE: ${fullName}
NÚMEROS:
- Número del Alma (vibración interna, día de nacimiento): ${numbers.soul}${masterTag(numbers.soul)}
- Camino de Vida (sendero principal, fecha completa): ${numbers.destiny}${masterTag(numbers.destiny)}
- Deseo del Corazón (vocales del nombre): ${numbers.mission}${masterTag(numbers.mission)}
- Año Personal (ciclo anual actual): ${numbers.personalYear}${masterTag(numbers.personalYear)}

INSTRUCCIONES:
- Interpreta desde el marco Pitagórico: vibraciones, camino de vida, potencial práctico
- Sé conciso pero profundo. Cada campo debe ser una joya breve.
- Máximo 1200 tokens en total.

Responde ÚNICAMENTE con este JSON (sin bloques de código):
{
  "intro": "2-3 oraciones capturando la esencia vibracional del mapa de ${firstName}. Menciona si hay números maestros.",
  "highlights": [
    { "key": "soul", "number": ${numbers.soul}, "title": "Alma", "insight": "1-2 oraciones sobre su vibración interna — la frecuencia con la que naturalmente opera." },
    { "key": "destiny", "number": ${numbers.destiny}, "title": "Camino de Vida", "insight": "1-2 oraciones sobre su sendero principal — las experiencias que la vida le presenta." },
    { "key": "mission", "number": ${numbers.mission}, "title": "Deseo del Corazón", "insight": "1-2 oraciones sobre lo que realmente anhela y su motivación profunda." }
  ],
  "currentYear": "1-2 oraciones sobre el Año Personal ${numbers.personalYear} y qué oportunidades y temas trae este ciclo.",
  "keyTheme": "1 oración poderosa que resuma el potencial y el camino de vida de ${firstName}."
}`;
}
