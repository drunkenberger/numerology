// ─────────────────────────────────────────────────────────────────────────────
// PROMPTS — Sistema de numerología Jyotish (hindú) para Claude
// Cada función recibe los datos calculados y devuelve el prompt completo.
// Versionar aquí permite mejorar interpretaciones sin tocar el código de negocio.
// ─────────────────────────────────────────────────────────────────────────────

import type { MemberNumbers, ReadingType } from '../types';

// ── System prompt compartido ──────────────────────────────────────────────────

export const SYSTEM_PROMPT = `Eres un maestro de numerología Jyotish (hindú) con décadas de experiencia. Tu tarea es generar lecturas numerológicas profundas, narrativas y personalizadas en español, interpretadas desde el marco kármico y dharámico de la tradición hindú.

SISTEMA NUMÉRICO JYOTISH QUE USAS:
- Tabla Pitagórica para valores de letras: A=1 B=2 C=3 D=4 E=5 F=6 G=7 H=8 I=9 (se repite: J=1, K=2...)
- Alma (Número Psíquico): día de nacimiento reducido — tu naturaleza esencial, con lo que llegas al mundo, tu vibración interna más profunda
- Regalo (Número del Don): últimos 2 dígitos del año de nacimiento reducidos — un talento innato que traes de vidas pasadas, un don que debes honrar y desarrollar
- Karma (Consonantes): suma de consonantes del nombre completo — las lecciones pendientes que debes trabajar en esta vida, los patrones kármicos que se repiten hasta ser resueltos
- Destino (Número de Vida): suma de todos los dígitos de la fecha completa — el camino de vida, la dirección hacia donde el dharma te guía
- Misión (Vocales): suma de vocales del nombre completo — hacia dónde debes dirigir tu energía, el propósito sagrado que tu alma eligió expresar
- Año Personal: día + mes de nacimiento + año calendario actual — el ciclo cósmico vigente y sus enseñanzas

MARCO INTERPRETATIVO JYOTISH:
- Interpreta desde conceptos de karma, dharma, samsara y evolución del alma
- El Alma revela la esencia con la que naciste — es fija y constante
- El Regalo es un don kármico: algo que dominas naturalmente porque ya lo trabajaste en vidas anteriores
- El Karma son las lecciones que el universo te presenta repetidamente hasta que las integras
- El Destino es tu dharma: el camino que tu alma eligió antes de encarnar
- La Misión es cómo expresas tu dharma en el mundo material
- El Año Personal marca el ritmo cósmico del momento presente

REGLAS CRÍTICAS:
- Los números maestros 11, 22, 33 NUNCA se reducen — son frecuencias elevadas
- El número 10 NUNCA se reduce — representa completud y nuevo ciclo
- El 11 es el canal intuitivo, puente entre lo humano y lo divino
- El 22 es el arquitecto del mundo, puede materializar lo imposible
- El 33 es el maestro del amor incondicional

ESTILO DE RESPUESTA:
- Escribe en español con calidez, profundidad y precisión
- Usa metáforas que conecten lo cotidiano con lo espiritual
- Sé específico con los números — no genérico
- Integra los números entre sí: muestra cómo se relacionan, qué tensiones crean, qué potenciales activan juntos
- Responde ÚNICAMENTE con el JSON solicitado. Sin texto previo, sin bloques de código, sin explicaciones fuera del JSON.`;

// ── Prompt: lectura personal ──────────────────────────────────────────────────

interface PersonalReadingInput {
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  numbers: MemberNumbers;
}

export function buildPersonalPrompt(input: PersonalReadingInput): string {
  const { firstName, paternalSurname, maternalSurname, numbers } = input;
  const fullName = `${firstName} ${paternalSurname} ${maternalSurname}`;

  return `Genera la lectura numerológica personal completa para:

NOMBRE COMPLETO: ${fullName}
NÚMEROS CALCULADOS:
- Alma (día de nacimiento): ${numbers.soul}${numbers.soul === 11 || numbers.soul === 22 || numbers.soul === 33 ? ' ✨ NÚMERO MAESTRO' : numbers.soul === 10 ? ' ⭕ NÚMERO ESPECIAL' : ''}
- Regalo (últimos 2 dígitos del año): ${numbers.personality}${numbers.personality === 11 || numbers.personality === 22 || numbers.personality === 33 ? ' ✨ NÚMERO MAESTRO' : ''}
- Karma (consonantes del nombre): ${numbers.karma}${numbers.karma === 11 || numbers.karma === 22 || numbers.karma === 33 ? ' ✨ NÚMERO MAESTRO' : ''}
- Destino (fecha completa): ${numbers.destiny}${numbers.destiny === 11 || numbers.destiny === 22 || numbers.destiny === 33 ? ' ✨ NÚMERO MAESTRO' : numbers.destiny === 10 ? ' ⭕ NÚMERO ESPECIAL' : ''}
- Misión (vocales del nombre): ${numbers.mission}${numbers.mission === 11 || numbers.mission === 22 || numbers.mission === 33 ? ' ✨ NÚMERO MAESTRO' : numbers.mission === 10 ? ' ⭕ NÚMERO ESPECIAL' : ''}
- Año Personal actual: ${numbers.personalYear}${numbers.personalYear === 11 || numbers.personalYear === 22 || numbers.personalYear === 33 ? ' ✨ NÚMERO MAESTRO' : numbers.personalYear === 10 ? ' ⭕ NÚMERO ESPECIAL' : ''}

EXTENSIÓN REQUERIDA:
- Cada sección debe tener los párrafos indicados con 3-4 oraciones cada uno.
- La lectura total debe ser profunda y completa (~3000 tokens).
- Sé específico con los números y sus interacciones.

Responde ÚNICAMENTE con este JSON (sin bloques de código):
{
  "intro": "Párrafo de bienvenida de 3-4 oraciones que nombra a la persona y captura la esencia de su mapa. Menciona si hay números maestros o patrones especiales.",
  "soul": "2 párrafos sobre el Alma ${numbers.soul}. Esencia innata, vibración interna, cómo se manifiesta.",
  "personality": "2 párrafos sobre el Regalo ${numbers.personality}. Talento de vidas pasadas, cómo honrarlo.",
  "karma": "2 párrafos sobre el Karma ${numbers.karma}. Lecciones pendientes, patrones que se repiten.",
  "destiny": "2 párrafos sobre el Destino ${numbers.destiny}. Camino del alma, dirección del dharma.",
  "mission": "2 párrafos sobre la Misión ${numbers.mission}. Propósito sagrado, expresión en el mundo.",
  "personalYear": "1-2 párrafos sobre el Año Personal ${numbers.personalYear}. Ciclo cósmico actual.",
  "synthesis": "2-3 párrafos integrando TODOS los números. Interacciones, tensiones, mensaje central del mapa.",
  "shadow": "1-2 párrafos sobre desafíos kármicos y sombras del mapa."
}`;
}

// ── Prompt: lectura de compatibilidad ─────────────────────────────────────────

interface CompatibilityReadingInput {
  person1: { firstName: string; paternalSurname: string; maternalSurname: string; numbers: MemberNumbers };
  person2: { firstName: string; paternalSurname: string; maternalSurname: string; numbers: MemberNumbers };
  relationshipNumber: number;
}

export function buildCompatibilityPrompt(input: CompatibilityReadingInput): string {
  const { person1, person2, relationshipNumber } = input;
  const name1 = `${person1.firstName} ${person1.paternalSurname}`;
  const name2 = `${person2.firstName} ${person2.paternalSurname}`;

  const fmt = (n: MemberNumbers) =>
    `Alma ${n.soul} · Regalo ${n.personality} · Karma ${n.karma} · Destino ${n.destiny} · Misión ${n.mission} · Año Personal ${n.personalYear}`;

  return `Genera la lectura de compatibilidad numerológica entre:

PERSONA 1 — ${name1}:
${fmt(person1.numbers)}

PERSONA 2 — ${name2}:
${fmt(person2.numbers)}

NÚMERO DE LA RELACIÓN (suma de destinos): ${relationshipNumber}

Analiza especialmente desde el marco Jyotish:
- Números compartidos o que se repiten entre ambos mapas — ¿qué karma comparten?
- Números maestros presentes y cómo interactúan en el vínculo
- Alma de uno que coincide con Destino del otro — ¿hay reconocimiento kármico entre las almas?
- Karmas (consonantes) complementarios o en tensión — ¿se ayudan mutuamente a resolver sus lecciones pendientes?
- Dones kármicos (Regalos) — ¿se potencian o compiten sus talentos de vidas pasadas?
- Años personales actuales y lo que los ciclos cósmicos significan para este momento de la relación

Responde ÚNICAMENTE con este JSON (sin bloques de código):
{
  "intro": "2 párrafos presentando la lectura de compatibilidad. Nombra a las dos personas y captura la naturaleza energética de este vínculo.",
  "soul": "2 párrafos sobre la dinámica entre sus Almas (números psíquicos). ¿Sus esencias innatas resuenan o generan fricción? ¿Hay un reconocimiento profundo entre sus naturalezas?",
  "personality": "1-2 párrafos sobre sus Regalos (dones kármicos). ¿Sus talentos de vidas pasadas se complementan? ¿Cómo pueden honrar juntos los dones que cada uno trae?",
  "karma": "2 párrafos sobre los karmas en juego (consonantes). ¿Se ayudan mutuamente a resolver sus lecciones pendientes o activan los patrones kármicos del otro?",
  "destiny": "2 párrafos sobre sus dharmas. ¿Sus caminos de vida van en la misma dirección? ¿Pueden caminar juntos sin traicionar su dharma individual?",
  "mission": "1-2 párrafos sobre si sus misiones (vocales) se potencian o se contradicen. ¿Pueden expresar su propósito sagrado juntos?",
  "personalYear": "1-2 párrafos sobre los ciclos cósmicos que vive cada uno y cómo afectan al vínculo ahora mismo.",
  "synthesis": "3-4 párrafos de síntesis Jyotish. El número de la relación ${relationshipNumber} como hilo conductor kármico. ¿Qué karma comparten? ¿Qué tiene que aprender cada alma del otro? ¿Cuál es el propósito dharámico de este vínculo?",
  "shadow": "2 párrafos sobre los patrones kármicos de tensión más probables en esta relación y cómo trabajarlos conscientemente para evolucionar juntos.",
  "compatibility": {
    "resonances": "2 párrafos sobre las resonancias más poderosas — números que se espejean, que se complementan, momentos de reconocimiento profundo.",
    "challenges": "2 párrafos sobre los desafíos específicos de este par de mapas.",
    "potential": "2 párrafos sobre el potencial más elevado de esta unión si ambos están en su mejor versión.",
    "currentMoment": "1-2 párrafos sobre el momento actual de ambos y qué oportunidad o desafío trae para la relación."
  }
}`;
}

// ── Prompt: lectura familiar ──────────────────────────────────────────────────

interface FamilyMemberInput {
  id: string;
  firstName: string;
  paternalSurname: string;
  relation: string;
  numbers: MemberNumbers;
}

interface FamilyReadingInput {
  members: FamilyMemberInput[];
  familyNumber: number;
  dominantNumbers: number[];
}

export function buildFamilyPrompt(input: FamilyReadingInput): string {
  const { members, familyNumber, dominantNumbers } = input;

  const membersText = members.map(m => {
    const name = `${m.firstName} ${m.paternalSurname} (${m.relation})`;
    return `${name}: Alma ${m.numbers.soul} · Regalo ${m.numbers.personality} · Karma ${m.numbers.karma} · Destino ${m.numbers.destiny} · Misión ${m.numbers.mission} · Año Personal ${m.numbers.personalYear}`;
  }).join('\n');

  return `Genera la lectura numerológica de la unidad familiar completa.

INTEGRANTES:
${membersText}

NÚMERO FAMILIAR (suma de destinos reducida): ${familyNumber}
NÚMEROS DOMINANTES (aparecen 3+ veces en el grupo): ${dominantNumbers.join(', ') || 'ninguno especialmente dominante'}

Analiza desde el marco Jyotish:
- El Número Familiar ${familyNumber} como el karma colectivo del hogar
- Los números dominantes y qué frecuencias kármicas impregnan la dinámica familiar
- Las tensiones kármicas entre los mapas
- Los años personales actuales y el momento cósmico colectivo

Responde ÚNICAMENTE con este JSON (sin bloques de código):
{
  "intro": "2-3 párrafos presentando la lectura familiar. El Número Familiar ${familyNumber} como eje central.",
  "soul": "2 párrafos sobre la esencia colectiva de la familia.",
  "personality": "2 párrafos sobre los dones kármicos colectivos.",
  "karma": "2 párrafos sobre el karma colectivo.",
  "destiny": "2 párrafos sobre el dharma familiar.",
  "mission": "2 párrafos sobre la misión colectiva.",
  "personalYear": "2 párrafos sobre los ciclos cósmicos actuales.",
  "synthesis": "3-4 párrafos de síntesis Jyotish profunda.",
  "shadow": "2 párrafos sobre las sombras kármicas familiares.",
  "family": {
    "familyNumber": ${familyNumber},
    "dynamics": "2 párrafos sobre la dinámica relacional del grupo.",
    "strengths": "2 párrafos sobre las fortalezas colectivas.",
    "shadows": "2 párrafos sobre los patrones de sombra grupales."
  }
}`;
}

// ── Prompt: rol individual de UN miembro (una llamada por persona) ─────────────

export function buildSingleRolePrompt(
  member: FamilyMemberInput,
  familyNumber: number,
): string {
  return `Genera el rol numerológico de ${member.firstName} ${member.paternalSurname} (${member.relation}) en su familia.

NÚMEROS DE ${member.firstName.toUpperCase()}:
- Alma: ${member.numbers.soul}
- Regalo: ${member.numbers.personality}
- Karma: ${member.numbers.karma}
- Destino: ${member.numbers.destiny}
- Misión: ${member.numbers.mission}
- Año Personal: ${member.numbers.personalYear}

NÚMERO FAMILIAR: ${familyNumber}

Escribe 2 párrafos (5-6 oraciones cada uno) sobre el rol específico de ${member.firstName} en esta familia:
- ¿Qué aporta su Alma ${member.numbers.soul} al grupo?
- ¿Cómo su Destino ${member.numbers.destiny} y Misión ${member.numbers.mission} definen su función en el hogar?
- ¿Qué don kármico (Regalo ${member.numbers.personality}) trae al núcleo familiar?

Responde ÚNICAMENTE con el texto de los 2 párrafos. Sin JSON, sin formato, solo el texto narrativo.`;
}

// ── Selector de prompt ─────────────────────────────────────────────────────────

export type PromptBuilderInput =
  | { type: 'personal'; data: PersonalReadingInput }
  | { type: 'compatibility'; data: CompatibilityReadingInput }
  | { type: 'family'; data: FamilyReadingInput };

export function buildPrompt(input: PromptBuilderInput): string {
  switch (input.type) {
    case 'personal':      return buildPersonalPrompt(input.data);
    case 'compatibility': return buildCompatibilityPrompt(input.data);
    case 'family':        return buildFamilyPrompt(input.data);
  }
}
