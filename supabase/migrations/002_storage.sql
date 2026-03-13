-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION 002 — Supabase Storage: bucket para exportaciones HTML
-- Ejecutar después de 001_initial_schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Crear bucket privado para lecturas exportadas ─────────────────────────────
-- Los archivos son privados: solo accesibles via URL firmada generada por el backend.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reading-exports',
  'reading-exports',
  false,                                      -- privado
  5242880,                                    -- 5 MB máximo por archivo
  array['text/html', 'application/pdf']
)
on conflict (id) do nothing;

-- ── Políticas de Storage ──────────────────────────────────────────────────────

-- El backend (service_role) puede subir archivos — no necesita política RLS
-- (service_role bypasea RLS por diseño en Supabase)

-- Los usuarios autenticados pueden leer sus propios archivos
-- La ruta del archivo es: {user_id}/{reading_id}.html
create policy "reading-exports: usuario lee solo los suyos"
  on storage.objects
  for select
  using (
    bucket_id = 'reading-exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Los usuarios NO pueden subir directamente (solo el backend via service_role)
-- No se crea política de INSERT para usuarios
