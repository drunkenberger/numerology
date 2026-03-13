-- ─────────────────────────────────────────────────────────────────────────────
-- SEED — Datos de prueba para desarrollo local
-- NUNCA ejecutar en producción.
-- Requiere que exista un usuario en auth.users con id = '00000000-0000-0000-0000-000000000001'
-- Crear ese usuario manualmente en Supabase Dashboard > Authentication antes de correr este seed.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Usuario de prueba (perfil del padre / usuario principal) ──────────────────
insert into public.profiles (
  id, first_name, paternal_surname, maternal_surname,
  birth_day, birth_month, birth_year,
  language, is_premium
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Dev',
  'González',
  'Morelos',
  29, 7, 1981,
  'es',
  true   -- premium para poder probar las lecturas completas
)
on conflict (id) do update set
  is_premium = true,
  updated_at = now();

-- ── Familia González Morelos — los 4 mapas reales como casos de prueba ─────────

-- Verónica (pareja)
insert into public.family_members (
  id, user_id,
  first_name, paternal_surname, maternal_surname,
  birth_day, birth_month, birth_year,
  relation,
  numbers
)
values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Verónica', 'Morelos', 'Zaragoza Gutiérrez',
  24, 8, 1977,
  'pareja',
  '{
    "soul": 6,
    "personality": 6,
    "karma": 6,
    "destiny": 11,
    "mission": 3,
    "personalYear": 5
  }'::jsonb
)
on conflict (id) do nothing;

-- Eugenio (hijo)
insert into public.family_members (
  id, user_id,
  first_name, paternal_surname, maternal_surname,
  birth_day, birth_month, birth_year,
  relation,
  numbers
)
values (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Eugenio', 'González', 'Morelos Zaragoza',
  9, 1, 2020,
  'hijo',
  '{
    "soul": 3,
    "personality": 11,
    "karma": 9,
    "destiny": 5,
    "mission": 5,
    "personalYear": 2
  }'::jsonb
)
on conflict (id) do nothing;

-- Marcelo (hijo)
insert into public.family_members (
  id, user_id,
  first_name, paternal_surname, maternal_surname,
  birth_day, birth_month, birth_year,
  relation,
  numbers
)
values (
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Marcelo', 'González', 'Morelos Zaragoza',
  5, 6, 2023,
  'hijo',
  '{
    "soul": 5,
    "personality": 9,
    "karma": 5,
    "destiny": 9,
    "mission": 5,
    "personalYear": 2
  }'::jsonb
)
on conflict (id) do nothing;

-- Perfil propio del padre en family_members (para poder incluirlo en lecturas familiares)
insert into public.family_members (
  id, user_id,
  first_name, paternal_surname, maternal_surname,
  birth_day, birth_month, birth_year,
  relation,
  numbers
)
values (
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'Dev', 'González', 'Morelos',
  29, 7, 1981,
  'yo',
  '{
    "soul": 11,
    "personality": 9,
    "karma": 11,
    "destiny": 10,
    "mission": 10,
    "personalYear": 10
  }'::jsonb
)
on conflict (id) do nothing;
