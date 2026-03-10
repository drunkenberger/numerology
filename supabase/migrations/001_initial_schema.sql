-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION 001 — Esquema inicial de Jyotish Numerology
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensiones ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: profiles
-- Un registro por usuario autenticado. Se crea automáticamente al registrarse.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid        primary key references auth.users(id) on delete cascade,
  first_name          text        not null,
  paternal_surname    text        not null,
  maternal_surname    text        not null default '',
  birth_day           smallint    not null check (birth_day between 1 and 31),
  birth_month         smallint    not null check (birth_month between 1 and 12),
  birth_year          smallint    not null check (birth_year between 1900 and 2100),
  language            text        not null default 'es' check (language in ('es', 'en')),
  is_premium          boolean     not null default false,
  rc_customer_id      text        unique,                    -- RevenueCat customer ID
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.profiles is 'Perfil numerológico del usuario. Extiende auth.users.';
comment on column public.profiles.rc_customer_id is 'ID del cliente en RevenueCat. Se sincroniza via webhook.';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: family_members
-- Perfiles de pareja, hijos, padres u otras personas que el usuario quiere leer.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.family_members (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null references public.profiles(id) on delete cascade,
  first_name          text        not null,
  paternal_surname    text        not null,
  maternal_surname    text        not null default '',
  birth_day           smallint    not null check (birth_day between 1 and 31),
  birth_month         smallint    not null check (birth_month between 1 and 12),
  birth_year          smallint    not null check (birth_year between 1900 and 2100),
  relation            text        not null check (
                                    relation in ('yo', 'pareja', 'hijo', 'hija', 'madre', 'padre', 'hermano', 'hermana', 'amigo', 'amiga', 'otro')
                                  ),
  -- Números calculados (guardados para no recalcular en cada request)
  numbers             jsonb,      -- { soul, personality, karma, destiny, mission, personalYear }
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.family_members is 'Personas del entorno del usuario para quienes se generan lecturas.';
comment on column public.family_members.numbers is 'Mapa numerológico calculado. soul, personality, karma, destiny, mission, personalYear.';
comment on column public.family_members.relation is 'Relación con el usuario: pareja, hijo, hija, madre, padre, etc.';

-- Índice para buscar miembros de un usuario rápidamente
create index if not exists idx_family_members_user_id
  on public.family_members(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: readings
-- Lecturas generadas por Claude. Cacheadas por cache_key para evitar duplicados.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.readings (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null references public.profiles(id) on delete cascade,
  type                text        not null check (type in ('personal', 'compatibility', 'family')),
  -- IDs de los family_members involucrados en esta lectura
  members             uuid[]      not null,
  -- Cache key determinista: type::soul:pers:karma:destiny:mission:year|... (uno por miembro)
  cache_key           text        not null,
  -- Resumen corto para usuarios free (hardcodeado, no consume Claude)
  summary             text        not null default '',
  -- Lectura completa generada por Claude (solo se llena para usuarios premium)
  full_content        jsonb,
  -- URL del HTML exportable en Supabase Storage (se genera en background)
  html_export         text,
  created_at          timestamptz not null default now()
);

comment on table public.readings is 'Lecturas numerológicas generadas. Cache para evitar llamadas duplicadas a Claude.';
comment on column public.readings.cache_key is 'Hash determinista de type + números de todos los miembros. Mismo key = misma lectura.';
comment on column public.readings.members is 'Array de IDs de family_members involucrados.';

-- Índice para buscar lecturas del usuario
create index if not exists idx_readings_user_id
  on public.readings(user_id);

-- Índice para búsquedas de caché (el query más frecuente del backend)
create index if not exists idx_readings_cache_key
  on public.readings(user_id, cache_key)
  where full_content is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Cada usuario solo puede ver y modificar sus propios datos.
-- ─────────────────────────────────────────────────────────────────────────────

-- profiles
alter table public.profiles enable row level security;

create policy "profiles: usuario ve y edita solo el suyo"
  on public.profiles
  for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- family_members
alter table public.family_members enable row level security;

create policy "family_members: usuario ve y edita solo los suyos"
  on public.family_members
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- readings
alter table public.readings enable row level security;

create policy "readings: usuario ve y edita solo las suyas"
  on public.readings
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCIÓN: updated_at automático
-- Actualiza el campo updated_at en cada UPDATE.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_family_members_updated_at
  before update on public.family_members
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCIÓN: auto-crear perfil al registrarse
-- Se ejecuta cuando auth.users inserta un nuevo usuario.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Crea un perfil mínimo. El usuario completa nombre y fecha en el onboarding.
  insert into public.profiles (id, first_name, paternal_surname, birth_day, birth_month, birth_year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'paternal_surname', ''),
    1,   -- placeholder — el usuario lo completa en onboarding
    1,
    2000
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
