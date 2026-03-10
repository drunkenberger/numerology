# Jyotish Numerology

App móvil y web de numerología hindú/Pitagórica con interpretaciones generadas por Claude API.

## Stack

| Capa | Tecnología |
|------|------------|
| Mobile/Web | Expo + React Native + expo-router |
| Backend | Node.js + Express |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| IA | Claude API (`claude-sonnet-4-6`) |
| Pagos | RevenueCat |

## Estructura

```
jyotish-numerology/
├── apps/
│   ├── mobile/          # Expo app — iOS + Android + Web
│   └── api/             # Node.js API
├── packages/
│   ├── numerology/      # Motor de cálculos (TypeScript puro, 52 tests)
│   ├── prompts/         # Prompts de Claude versionados
│   └── html-templates/  # Templates HTML de lecturas exportables
├── supabase/
│   ├── migrations/      # SQL migrations en orden
│   └── seed.sql         # Datos de prueba (solo desarrollo)
├── CLAUDE.md            # Contexto completo para Claude Code
├── turbo.json
└── package.json
```

## Inicio rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

```bash
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env con tus keys reales
```

### 3. Base de datos (Supabase)

Ejecutar en orden en Supabase Dashboard → SQL Editor:

```bash
# 1. Esquema inicial
supabase/migrations/001_initial_schema.sql

# 2. Storage bucket
supabase/migrations/002_storage.sql

# 3. Datos de prueba (solo en desarrollo)
supabase/seed.sql
```

### 4. Correr en desarrollo

```bash
# Todo el monorepo
npm run dev

# Solo la API
npm run api

# Solo la app móvil
npm run mobile
```

### 5. Tests

```bash
# Todos los packages
npm test

# Solo el motor de cálculos
cd packages/numerology && npm test

# Solo la API
cd apps/api && npm test
```

## API Endpoints

```
POST /generate-reading     — Genera una lectura premium (requiere auth + premium)
GET  /generate-reading/:id — Obtiene una lectura guardada
POST /webhooks/revenuecat  — Webhook de RevenueCat
GET  /health               — Health check
```

### Ejemplo: generar lectura personal

```bash
curl -X POST http://localhost:3000/generate-reading \
  -H "Authorization: Bearer <supabase-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "personal",
    "memberIds": ["<uuid-de-family-member>"]
  }'
```

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `ANTHROPIC_API_KEY` | API key de Anthropic — **NUNCA al cliente** |
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **NUNCA al cliente** |
| `REVENUECAT_WEBHOOK_SECRET` | Secret para verificar webhooks de RC |

## Estado del proyecto

- [x] `packages/numerology` — motor de cálculos (52 tests ✅)
- [x] `apps/api` — backend Node.js completo (13 tests ✅)
- [x] `supabase/migrations` — esquema completo con RLS
- [x] Monorepo Turborepo configurado
- [ ] `apps/mobile` — Expo app
- [ ] `packages/html-templates` — templates de exportación
