// ─────────────────────────────────────────────────────────────────────────────
// SERVICE — HTML Export
// Genera el HTML de una lectura y lo sube a Supabase Storage.
// Se llama en background después de guardar la lectura en Supabase.
// ─────────────────────────────────────────────────────────────────────────────

import { render } from '@jyotish/html-templates';
import type { TemplateInput, ReadingMember } from '@jyotish/html-templates';
import { supabase } from '../utils/supabase';
import type { ReadingType, Interpretation, ReadingContent, FamilyMemberRow } from '../types';

const BUCKET = 'reading-exports';

// ── Generar y subir HTML ──────────────────────────────────────────────────────

export async function generateAndUploadHtml(params: {
  readingId:      string;
  userId:         string;
  type:           ReadingType;
  interpretation: Interpretation;
  members:        FamilyMemberRow[];
  content:        ReadingContent;
}): Promise<{ url: string; html: string } | null> {
  const { readingId, userId, type, interpretation, members, content } = params;

  // 1. Construir el TemplateInput
  const templateMembers: ReadingMember[] = members.map(m => ({
    id:              m.id,
    firstName:       m.first_name,
    paternalSurname: m.paternal_surname,
    maternalSurname: m.maternal_surname,
    relation:        m.relation,
    numbers:         m.numbers!,
  }));

  const templateInput: TemplateInput = {
    type,
    interpretation,
    members:     templateMembers,
    content,
    generatedAt: new Date(),
    language:    'es',
  };

  // 2. Renderizar HTML
  let html: string;
  try {
    html = render(templateInput);
  } catch (err) {
    console.error('[html-export] Render error:', err);
    return null;
  }

  // 3. Subir a Supabase Storage
  // Path: {userId}/{readingId}.html  — coincide con la política RLS de Storage
  const path = `${userId}/${readingId}.html`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(html, 'utf-8'), {
      contentType:  'text/html; charset=utf-8',
      cacheControl: '3600',
      upsert:       true,
    });

  if (uploadError) {
    console.error('[html-export] Upload error:', uploadError.message);
    return null;
  }

  // 4. Generar signed URL válida por 1 año (para descarga desde la app)
  const { data: signedData, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 año en segundos

  if (signError || !signedData) {
    console.error('[html-export] Signed URL error:', signError?.message);
    return null;
  }

  // 5. Actualizar el registro en la tabla readings con la URL
  const { error: updateError } = await supabase
    .from('readings')
    .update({ html_export: signedData.signedUrl })
    .eq('id', readingId)
    .eq('user_id', userId);

  if (updateError) {
    console.error('[html-export] DB update error:', updateError.message);
    // No es fatal — la lectura ya está guardada, solo falta el link de descarga
    return null;
  }

  return { url: signedData.signedUrl, html };
}
