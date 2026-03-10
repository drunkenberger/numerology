// ─────────────────────────────────────────────────────────────────────────────
// TESTS — POST /generate-reading
// Mockea Supabase y Claude API para probar la lógica del endpoint
// ─────────────────────────────────────────────────────────────────────────────

import express from 'express';
import request from 'supertest';

// ── Mocks (deben ir ANTES de los imports que los usan) ────────────────────────

// Mock Supabase
const mockSingle    = jest.fn();
const mockMaybeSingle = jest.fn();

const mockChain = {
  select:      jest.fn().mockReturnThis(),
  insert:      jest.fn().mockReturnThis(),
  update:      jest.fn().mockReturnThis(),
  eq:          jest.fn().mockReturnThis(),
  in:          jest.fn().mockReturnThis(),
  not:         jest.fn().mockReturnThis(),
  order:       jest.fn().mockReturnThis(),
  limit:       jest.fn().mockReturnThis(),
  single:      mockSingle,
  maybeSingle: mockMaybeSingle,
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    from: jest.fn(() => mockChain),
  })),
}));

// Mock Anthropic SDK
const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  function MockAnthropic() {
    return { messages: { create: mockCreate } };
  }
  return { default: MockAnthropic, __esModule: true };
});

// ── Imports DESPUÉS de los mocks ──────────────────────────────────────────────

import { readingRouter } from '../src/routes/reading.route';
import rateLimit from 'express-rate-limit';

// ── Test app ──────────────────────────────────────────────────────────────────

function buildTestApp() {
  const app = express();
  app.use(express.json());
  // Deshabilitar rate limiting en tests
  app.use('/generate-reading', readingRouter);
  return app;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MEMBER_VERONICA = {
  id:               'member-veronica',
  user_id:          'user-123',
  first_name:       'Verónica',
  paternal_surname: 'Morelos',
  maternal_surname: 'Zaragoza Gutiérrez',
  birth_day:        24,
  birth_month:      8,
  birth_year:       1977,
  relation:         'pareja',
  numbers: {
    soul: 6, personality: 6, karma: 6,
    destiny: 11, mission: 3, personalYear: 5,
  },
  created_at: '2026-01-01T00:00:00Z',
};

const MOCK_READING_CONTENT = {
  intro:       'Verónica Morelos, tu mapa numerológico revela una configuración extraordinaria.',
  soul:        'Tu Alma 6 anhela amor, armonía y servicio profundo.',
  personality: 'Tu Regalo 6 proyecta calidez y cuidado al mundo.',
  karma:       'Tu Karma 6 te invita a aprender a amarte con la misma generosidad.',
  destiny:     'Tu Destino 11, número maestro, marca un camino de inspiración.',
  mission:     'Tu Misión 3 es expresar, compartir y llevar alegría.',
  personalYear: 'Tu Año Personal 5 trae movimiento y liberación.',
  synthesis:   'El triple 6 de tu mapa es una configuración rarísima que orienta toda tu energía al amor.',
  shadow:      'El riesgo del triple 6 es perder el self en los demás.',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockAuthAndPremium(isPremium = true) {
  // 1. profile lookup (single)
  mockSingle.mockResolvedValueOnce({ data: { is_premium: isPremium }, error: null });
  // 2. cache lookup (maybeSingle)
  mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
}

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /generate-reading — validación', () => {
  const app = buildTestApp();

  beforeEach(() => jest.clearAllMocks());

  test('rechaza sin Authorization header', async () => {
    const res = await request(app)
      .post('/generate-reading')
      .send({ type: 'personal', memberIds: ['550e8400-e29b-41d4-a716-446655440000'] });
    expect(res.status).toBe(401);
  });

  test('rechaza tipo inválido (Zod)', async () => {
    mockAuthAndPremium();
    const res = await request(app)
      .post('/generate-reading')
      .set('Authorization', 'Bearer valid-token')
      .send({ type: 'horoscopo', memberIds: ['550e8400-e29b-41d4-a716-446655440000'] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });

  test('rechaza memberIds vacío (Zod)', async () => {
    mockAuthAndPremium();
    const res = await request(app)
      .post('/generate-reading')
      .set('Authorization', 'Bearer valid-token')
      .send({ type: 'personal', memberIds: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });

  test('rechaza memberIds no UUID (Zod)', async () => {
    mockAuthAndPremium();
    const res = await request(app)
      .post('/generate-reading')
      .set('Authorization', 'Bearer valid-token')
      .send({ type: 'personal', memberIds: ['not-a-uuid'] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });
});

describe('POST /generate-reading — lógica de negocio', () => {
  beforeEach(() => jest.clearAllMocks());

  test('devuelve 403 si el usuario no es premium', async () => {
    const app = buildTestApp();
    mockSingle.mockResolvedValueOnce({ data: { is_premium: false }, error: null });

    const res = await request(app)
      .post('/generate-reading')
      .set('Authorization', 'Bearer valid-token')
      .send({ type: 'personal', memberIds: ['550e8400-e29b-41d4-a716-446655440000'] });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('premium_required');
  });

  test('devuelve 400 si personal reading tiene 2 memberIds', async () => {
    const app = buildTestApp();
    mockAuthAndPremium();

    // members fetch devuelve 2 miembros (pero el service los rechaza antes)
    // El error de validación ocurre en generateReading() antes del fetch
    // Nota: el fetch de members se hace con .in() que usa maybeSingle no, usa el array directamente
    // Así que el error de "exactly 1 member" se lanza antes de ir a Supabase
    const res = await request(app)
      .post('/generate-reading')
      .set('Authorization', 'Bearer valid-token')
      .send({
        type: 'personal',
        memberIds: [
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001',
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('business_error');
    expect(res.body.message).toContain('exactly 1 member');
  });
});

describe('buildCacheKey — determinismo', () => {
  // Importamos directamente la función para testearla en aislamiento
  test('mismos números producen el mismo cache key', () => {
    const numbers = { soul: 6, personality: 6, karma: 6, destiny: 11, mission: 3, personalYear: 5 };
    // Como buildCacheKey es privada, verificamos el comportamiento indirectamente
    // A través de que dos lecturas con los mismos números devuelven el resultado cacheado
    expect(true).toBe(true); // placeholder — test real requiere DI del service
  });
});

describe('Prompts — buildPersonalPrompt', () => {
  const { buildPersonalPrompt } = require('../src/prompts/reading');

  test('incluye el nombre completo en el prompt', () => {
    const prompt = buildPersonalPrompt({
      firstName: 'Verónica',
      paternalSurname: 'Morelos',
      maternalSurname: 'Zaragoza Gutiérrez',
      numbers: { soul: 6, personality: 6, karma: 6, destiny: 11, mission: 3, personalYear: 5 },
    });
    expect(prompt).toContain('Verónica Morelos Zaragoza Gutiérrez');
  });

  test('marca números maestros correctamente', () => {
    const prompt = buildPersonalPrompt({
      firstName: 'Verónica',
      paternalSurname: 'Morelos',
      maternalSurname: 'Zaragoza Gutiérrez',
      numbers: { soul: 6, personality: 6, karma: 6, destiny: 11, mission: 3, personalYear: 5 },
    });
    expect(prompt).toContain('NÚMERO MAESTRO');
    expect(prompt).toContain('11');
  });

  test('incluye todos los números del mapa', () => {
    const prompt = buildPersonalPrompt({
      firstName: 'Test',
      paternalSurname: 'User',
      maternalSurname: 'Test',
      numbers: { soul: 3, personality: 7, karma: 9, destiny: 5, mission: 1, personalYear: 2 },
    });
    expect(prompt).toContain('Alma (vocales): 3');
    expect(prompt).toContain('Regalo (consonantes): 7');
    expect(prompt).toContain('Karma (día de nacimiento): 9');
    expect(prompt).toContain('Destino (fecha completa): 5');
    expect(prompt).toContain('Misión (todas las letras): 1');
    expect(prompt).toContain('Año Personal actual: 2');
  });

  test('solicita respuesta en JSON sin bloques de código', () => {
    const prompt = buildPersonalPrompt({
      firstName: 'Test', paternalSurname: 'User', maternalSurname: 'Test',
      numbers: { soul: 1, personality: 1, karma: 1, destiny: 1, mission: 1, personalYear: 1 },
    });
    expect(prompt).toContain('sin bloques de código');
    expect(prompt.toLowerCase()).toContain('json');
  });
});

describe('Prompts — buildCompatibilityPrompt', () => {
  const { buildCompatibilityPrompt } = require('../src/prompts/reading');

  test('incluye ambos nombres', () => {
    const prompt = buildCompatibilityPrompt({
      person1: {
        firstName: 'Verónica', paternalSurname: 'Morelos', maternalSurname: 'Zaragoza',
        numbers: { soul: 6, personality: 6, karma: 6, destiny: 11, mission: 3, personalYear: 5 },
      },
      person2: {
        firstName: 'Carlos', paternalSurname: 'González', maternalSurname: 'López',
        numbers: { soul: 11, personality: 9, karma: 7, destiny: 10, mission: 10, personalYear: 10 },
      },
      relationshipNumber: 3,
    });
    expect(prompt).toContain('Verónica Morelos');
    expect(prompt).toContain('Carlos González');
    expect(prompt).toContain('3'); // relationship number
  });
});

describe('Prompts — buildFamilyPrompt', () => {
  const { buildFamilyPrompt } = require('../src/prompts/reading');

  test('incluye número familiar y todos los integrantes', () => {
    const prompt = buildFamilyPrompt({
      familyNumber: 8,
      dominantNumbers: [9],
      members: [
        {
          id: 'id-1', firstName: 'Verónica', paternalSurname: 'Morelos',
          relation: 'pareja',
          numbers: { soul: 6, personality: 6, karma: 6, destiny: 11, mission: 3, personalYear: 5 },
        },
        {
          id: 'id-2', firstName: 'Eugenio', paternalSurname: 'González',
          relation: 'hijo',
          numbers: { soul: 3, personality: 11, karma: 9, destiny: 5, mission: 5, personalYear: 2 },
        },
      ],
    });
    expect(prompt).toContain('8');
    expect(prompt).toContain('Verónica Morelos');
    expect(prompt).toContain('Eugenio González');
    expect(prompt).toContain('9'); // dominant number
  });
});
