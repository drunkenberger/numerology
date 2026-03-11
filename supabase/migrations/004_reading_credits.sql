-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION 004 — Créditos de lectura para paywall
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Agregar columna de créditos de lectura al perfil
alter table public.profiles
  add column if not exists reading_credits integer not null default 0
  check (reading_credits >= 0);

comment on column public.profiles.reading_credits
  is 'Créditos disponibles para lecturas. Se decrementan al generar. Suscripción premium = ilimitado.';

-- Función atómica para deducir créditos (previene race conditions)
create or replace function public.deduct_reading_credit(user_id_input uuid)
returns integer
language plpgsql
security definer
as $$
declare
  new_credits integer;
begin
  update public.profiles
    set reading_credits = reading_credits - 1
    where id = user_id_input and reading_credits > 0
    returning reading_credits into new_credits;

  if new_credits is null then
    -- No se dedujo (ya estaba en 0)
    select reading_credits into new_credits
      from public.profiles where id = user_id_input;
  end if;

  return coalesce(new_credits, 0);
end;
$$;

-- Función atómica para agregar créditos (compras de RevenueCat)
create or replace function public.add_reading_credits(user_id_input uuid, amount_input integer)
returns integer
language plpgsql
security definer
as $$
declare
  new_credits integer;
begin
  update public.profiles
    set reading_credits = reading_credits + amount_input
    where id = user_id_input
    returning reading_credits into new_credits;

  return coalesce(new_credits, 0);
end;
$$;
