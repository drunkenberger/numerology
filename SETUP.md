# 🔱 Setup Completo - Jyotish Numerology

Guía paso a paso para configurar el proyecto en desarrollo local.

## ✅ Lo que ya está hecho

- ✅ Proyecto extraído en `~/BOTS y SCRIPTS/jyotish-numerology/`
- ✅ Dependencias instaladas (1385 packages)
- ✅ `.env` files creados:
  - `apps/api/.env` (backend)
  - `apps/mobile/.env` (Expo app)
- ✅ Supabase URL + keys configuradas

## ⚠️ Lo que falta

### 1. ANTHROPIC_API_KEY

Necesito tu API key de Anthropic para el backend.

**Opciones:**

a) **Script automático:**
   ```bash
   cd ~/BOTS\ y\ SCRIPTS/jyotish-numerology
   ./setup.sh
   ```
   Te va a pedir la key y configurar todo.

b) **Manual:**
   Edita `apps/api/.env` y reemplaza:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-TU_KEY_AQUI
   ```

### 2. Migraciones de Supabase

Las migraciones ya están escritas, solo falta ejecutarlas:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/iyrhkdrblbaiyiftgrhv)
2. Ve a **SQL Editor**
3. Ejecuta en orden:
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_storage.sql
   supabase/seed.sql  (opcional - datos de prueba)
   ```

**O usa el CLI de Supabase:**
```bash
cd ~/BOTS\ y\ SCRIPTS/jyotish-numerology
supabase db push
```

## 🚀 Correr el proyecto

Una vez configurado todo:

### Terminal 1: API Backend
```bash
cd ~/BOTS\ y\ SCRIPTS/jyotish-numerology
npm run api
```

Debería estar en: `http://localhost:3000`

### Terminal 2: Mobile App
```bash
cd ~/BOTS\ y\ SCRIPTS/jyotish-numerology
npm run mobile
```

Expo te mostrará un QR para escanear con tu teléfono, o apretar `i` para iOS simulator / `a` para Android emulator.

## 🧪 Testing

```bash
# Todos los tests
npm test

# Solo numerology
npm test --workspace=@jyotish/numerology

# Solo API
npm test --workspace=@jyotish/api
```

## 📊 Estado actual

| Componente | Status |
|------------|--------|
| packages/numerology | ✅ 52 tests |
| packages/html-templates | ✅ Completo |
| apps/api | ✅ 13 tests |
| apps/mobile | ✅ Todas las pantallas |
| Supabase migrations | ⏸️ Pendiente ejecutar |

## 🆘 Troubleshooting

### "Cannot find module '@jyotish/numerology'"
```bash
npm install --workspace=@jyotish/numerology
```

### "Supabase connection failed"
Verifica que ejecutaste las migraciones en Supabase Dashboard.

### "Anthropic API error"
Verifica que tu API key esté correcta en `apps/api/.env`

---

**¿Listo para empezar?** Corre `./setup.sh` o sigue los pasos manuales arriba. 🔱
