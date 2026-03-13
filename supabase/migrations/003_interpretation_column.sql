-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION 003 — Add interpretation column to readings
-- Allows switching between Hindu/Jyotish and Pythagorean interpretation frames.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.readings
  ADD COLUMN interpretation text NOT NULL DEFAULT 'hindu'
  CHECK (interpretation IN ('hindu', 'pythagorean'));

-- Recreate cache index to include interpretation (separate caches per interpretation)
DROP INDEX IF EXISTS idx_readings_cache_key;
CREATE INDEX idx_readings_cache_key
  ON public.readings(user_id, cache_key, interpretation)
  WHERE full_content IS NOT NULL;
