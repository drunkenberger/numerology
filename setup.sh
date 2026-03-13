#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# SETUP SCRIPT — Jyotish Numerology
# Configura el proyecto completo para desarrollo local
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit on error

echo "🔱 JYOTISH NUMEROLOGY - Setup"
echo ""

# ── 1. Verificar que estemos en el directorio correcto ──
if [[ ! -f "package.json" ]] || [[ ! -d "apps" ]]; then
  echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
  exit 1
fi

# ── 2. Verificar dependencias instaladas ──
echo "📦 Verificando dependencias..."
if [[ ! -d "node_modules" ]]; then
  echo "⚠️  node_modules no encontrado. Ejecutando npm install..."
  npm install --legacy-peer-deps
fi

# ── 3. Verificar .env files ──
echo ""
echo "🔧 Verificando archivos .env..."

API_ENV="apps/api/.env"
MOBILE_ENV="apps/mobile/.env"

if [[ ! -f "$API_ENV" ]]; then
  echo "❌ Falta $API_ENV"
  exit 1
fi

if [[ ! -f "$MOBILE_ENV" ]]; then
  echo "❌ Falta $MOBILE_ENV"
  exit 1
fi

# ── 4. Pedir ANTHROPIC_API_KEY si hace falta ──
if grep -q "PLACEHOLDER_NECESITO_TU_KEY" "$API_ENV"; then
  echo ""
  echo "⚠️  Falta tu ANTHROPIC_API_KEY"
  echo ""
  read -p "Pega tu Anthropic API key (sk-ant-...): " ANTHROPIC_KEY
  
  if [[ ! "$ANTHROPIC_KEY" =~ ^sk-ant- ]]; then
    echo "❌ API key inválida (debe empezar con sk-ant-)"
    exit 1
  fi
  
  # Reemplazar placeholder
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$ANTHROPIC_KEY/" "$API_ENV"
  else
    sed -i "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$ANTHROPIC_KEY/" "$API_ENV"
  fi
  
  echo "✅ API key configurada"
fi

# ── 5. Verificar Supabase ──
echo ""
echo "🗄️  Verificando Supabase..."
echo ""
echo "Debes ejecutar las migraciones manualmente en Supabase Dashboard:"
echo "  1. Ve a https://supabase.com/dashboard"
echo "  2. Abre tu proyecto: iyrhkdrblbaiyiftgrhv"
echo "  3. Ve a SQL Editor"
echo "  4. Ejecuta en orden:"
echo "     - supabase/migrations/001_initial_schema.sql"
echo "     - supabase/migrations/002_storage.sql"
echo "     - supabase/seed.sql (opcional - solo para testing)"
echo ""
read -p "¿Ya ejecutaste las migraciones? (y/n): " MIGRATIONS_DONE

if [[ "$MIGRATIONS_DONE" != "y" ]]; then
  echo ""
  echo "⏸️  Setup pausado. Ejecuta las migraciones y vuelve a correr este script."
  exit 0
fi

# ── 6. Build packages ──
echo ""
echo "🔨 Building packages..."
npm run build --workspace=@jyotish/numerology || echo "⚠️  Build de numerology falló (puede ser normal si no hay script de build)"
npm run build --workspace=@jyotish/html-templates || echo "⚠️  Build de html-templates falló (puede ser normal si no hay script de build)"

# ── 7. Correr tests ──
echo ""
echo "🧪 Corriendo tests..."
npm test --workspace=@jyotish/numerology
npm test --workspace=@jyotish/api

# ── 8. Listo! ──
echo ""
echo "✅ Setup completo!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "  1. Correr la API:"
echo "     npm run api"
echo ""
echo "  2. Correr la app mobile (en otra terminal):"
echo "     npm run mobile"
echo ""
echo "  3. Ver dashboard Supabase:"
echo "     https://supabase.com/dashboard/project/iyrhkdrblbaiyiftgrhv"
echo ""
echo "🔱 Happy coding!"
