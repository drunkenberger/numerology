// ─────────────────────────────────────────────────────────────────────────────
// INDEX — packages/html-templates
// Punto de entrada único. La API llama render(input) y recibe HTML listo.
// ─────────────────────────────────────────────────────────────────────────────

export type { TemplateInput, ReadingMember, ReadingContent, MemberNumbers, ReadingType } from './types';
export { renderPersonalReading }       from './personal.template';
export { renderCompatibilityReading }  from './compatibility.template';
export { renderFamilyReading }         from './family.template';

import { renderPersonalReading }       from './personal.template';
import { renderCompatibilityReading }  from './compatibility.template';
import { renderFamilyReading }         from './family.template';
import type { TemplateInput }          from './types';

/**
 * Función principal — la API solo necesita llamar esta.
 *
 * @example
 * const html = render({
 *   type: 'personal',
 *   members: [{ firstName: 'Verónica', ... }],
 *   content: { intro: '...', soul: '...', ... },
 * });
 * // → string HTML completo listo para guardar en Supabase Storage
 */
export function render(input: TemplateInput): string {
  switch (input.type) {
    case 'personal':      return renderPersonalReading(input);
    case 'compatibility': return renderCompatibilityReading(input);
    case 'family':        return renderFamilyReading(input);
    default:
      throw new Error(`Unknown reading type: ${(input as TemplateInput).type}`);
  }
}
