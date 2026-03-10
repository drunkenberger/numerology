// ─────────────────────────────────────────────────────────────────────────────
// TESTS — packages/html-templates
// ─────────────────────────────────────────────────────────────────────────────

import { render } from './index';
import type { TemplateInput } from './types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VERONICA_NUMBERS = {
  soul: 6, personality: 6, karma: 6,
  destiny: 11, mission: 3, personalYear: 5,
};

const PADRE_NUMBERS = {
  soul: 11, personality: 9, karma: 11,
  destiny: 10, mission: 10, personalYear: 10,
};

const EUGENIO_NUMBERS = {
  soul: 3, personality: 11, karma: 9,
  destiny: 5, mission: 5, personalYear: 2,
};

const MARCELO_NUMBERS = {
  soul: 5, personality: 9, karma: 5,
  destiny: 9, mission: 5, personalYear: 2,
};

const BASE_CONTENT = {
  intro:       'Verónica Morelos, tu mapa revela una configuración extraordinaria de triple 6.',
  soul:        'Tu Alma número 6 anhela armonía profunda.\n\nEste número vibra con el amor incondicional.',
  personality: 'Tu Regalo 6 proyecta calidez al mundo que te rodea.',
  karma:       'Tu Karma 6 te invita a aprender a amarte primero.',
  destiny:     'Tu Destino 11, número maestro, marca un camino de inspiración elevada.',
  mission:     'Tu Misión 3 es expresar, compartir y traer alegría.',
  personalYear:'Tu Año Personal 5 trae movimiento, libertad y nuevos horizontes.',
  synthesis:   'El triple 6 en tu mapa es una configuración rarísima.\n\nOrient toda tu energía hacia el amor.',
  shadow:      'El riesgo del triple 6 es perder el self en los demás.',
};

// ── Personal ──────────────────────────────────────────────────────────────────

describe('renderPersonalReading', () => {
  const input: TemplateInput = {
    type: 'personal',
    members: [{
      firstName: 'Verónica', paternalSurname: 'Morelos', maternalSurname: 'Zaragoza Gutiérrez',
      relation: 'pareja', numbers: VERONICA_NUMBERS,
    }],
    content: BASE_CONTENT,
    generatedAt: new Date('2026-03-07'),
  };

  test('genera HTML válido con DOCTYPE', () => {
    const html = render(input);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="es">');
  });

  test('incluye el nombre completo', () => {
    const html = render(input);
    expect(html).toContain('Verónica Morelos Zaragoza Gutiérrez');
  });

  test('incluye todos los números del mapa', () => {
    const html = render(input);
    expect(html).toContain('>6<'); // alma/regalo/karma
    expect(html).toContain('>11'); // destino maestro
    expect(html).toContain('>3<'); // misión
    expect(html).toContain('>5<'); // año personal
  });

  test('marca el 11 como número maestro', () => {
    const html = render(input);
    expect(html.toLowerCase()).toContain('maestro');
  });

  test('incluye todas las secciones de lectura', () => {
    const html = render(input);
    expect(html).toContain('El Alma');
    expect(html).toContain('El Regalo');
    expect(html).toContain('El Karma');
    expect(html).toContain('El Destino');
    expect(html).toContain('La Misión');
    expect(html).toContain('Año Personal');
    expect(html).toContain('Síntesis');
    expect(html).toContain('La Sombra');
  });

  test('escapa caracteres especiales en nombres', () => {
    const xssInput: TemplateInput = {
      ...input,
      members: [{
        ...input.members[0],
        firstName: '<script>alert("xss")</script>',
      }],
    };
    const html = render(xssInput);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  test('renderiza número especial 10 correctamente', () => {
    const inputWith10: TemplateInput = {
      ...input,
      members: [{
        ...input.members[0],
        numbers: { ...VERONICA_NUMBERS, destiny: 10 },
      }],
    };
    const html = render(inputWith10);
    expect(html).toContain('ESPECIAL');
  });

  test('funciona sin campo shadow', () => {
    const noShadow: TemplateInput = {
      ...input,
      content: { ...BASE_CONTENT, shadow: undefined },
    };
    const html = render(noShadow);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).not.toContain('La Sombra');
  });

  test('el HTML tiene estructura head/body', () => {
    const html = render(input);
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
    expect(html).toContain('</html>');
  });

  test('contiene estilos CSS embebidos', () => {
    const html = render(input);
    expect(html).toContain('<style>');
    expect(html).toContain('font-family');
  });
});

// ── Compatibility ─────────────────────────────────────────────────────────────

describe('renderCompatibilityReading', () => {
  const compatContent = {
    ...BASE_CONTENT,
    compatibility: {
      resonances:     'Sus Almas resuenan en la frecuencia del amor incondicional.',
      challenges:     'El Karma 6 de Verónica puede generar dependencia.',
      potential:      'Juntos pueden construir un hogar de profunda armonía.',
      currentMoment:  'El Año 5 de Verónica y el 10 del padre marcan transición.',
    },
  };

  const input: TemplateInput = {
    type: 'compatibility',
    members: [
      {
        firstName: 'Verónica', paternalSurname: 'Morelos', maternalSurname: 'Zaragoza',
        relation: 'pareja', numbers: VERONICA_NUMBERS,
      },
      {
        firstName: 'Dev', paternalSurname: 'González', maternalSurname: 'Morelos',
        relation: 'yo', numbers: PADRE_NUMBERS,
      },
    ],
    content: compatContent,
    generatedAt: new Date('2026-03-07'),
  };

  test('genera HTML con DOCTYPE', () => {
    const html = render(input);
    expect(html).toContain('<!DOCTYPE html>');
  });

  test('incluye ambos nombres', () => {
    const html = render(input);
    expect(html).toContain('Verónica Morelos');
    expect(html).toContain('Dev González');
  });

  test('muestra el número de la relación', () => {
    // destinos: 11 + 10 = 21 → reducción: 2+1 = 3
    const html = render(input);
    expect(html).toContain('Número de la Relación');
  });

  test('incluye sección de resonancias cuando compatibility está presente', () => {
    const html = render(input);
    expect(html).toContain('Resonancias Poderosas');
    expect(html).toContain('Desafíos del Vínculo');
    expect(html).toContain('Potencial Máximo');
  });

  test('falla correctamente con un solo miembro', () => {
    const badInput: TemplateInput = { ...input, members: [input.members[0]] };
    expect(() => render(badInput)).toThrow('exactly 2 members');
  });
});

// ── Family ────────────────────────────────────────────────────────────────────

describe('renderFamilyReading', () => {
  const familyContent = {
    ...BASE_CONTENT,
    intro: 'La familia González Morelos vibra como un núcleo extraordinario.',
    family: {
      familyNumber: 8,
      dynamics:     'Los cuatro miembros crean una dinámica de amor y expansión.',
      strengths:    'La fortaleza principal es la diversidad de misiones complementarias.',
      shadows:      'El riesgo colectivo es la dispersión de energías.',
      individualRoles: {
        'Verónica': 'Verónica es el corazón amoroso del núcleo familiar.',
        'Dev':      'Dev es el visionario que proyecta el camino hacia adelante.',
        'Eugenio':  'Eugenio trae la energía de expresión y comunicación al hogar.',
        'Marcelo':  'Marcelo introduce la vibración de libertad y aventura.',
      },
    },
  };

  const input: TemplateInput = {
    type: 'family',
    members: [
      { firstName: 'Verónica', paternalSurname: 'Morelos',  maternalSurname: '', relation: 'pareja', numbers: VERONICA_NUMBERS },
      { firstName: 'Dev',      paternalSurname: 'González', maternalSurname: '', relation: 'yo',     numbers: PADRE_NUMBERS },
      { firstName: 'Eugenio',  paternalSurname: 'González', maternalSurname: '', relation: 'hijo',   numbers: EUGENIO_NUMBERS },
      { firstName: 'Marcelo',  paternalSurname: 'González', maternalSurname: '', relation: 'hijo',   numbers: MARCELO_NUMBERS },
    ],
    content: familyContent,
    generatedAt: new Date('2026-03-07'),
  };

  test('genera HTML con DOCTYPE', () => {
    const html = render(input);
    expect(html).toContain('<!DOCTYPE html>');
  });

  test('incluye todos los nombres de la familia', () => {
    const html = render(input);
    expect(html).toContain('Verónica');
    expect(html).toContain('Eugenio');
    expect(html).toContain('Marcelo');
  });

  test('muestra el número familiar', () => {
    const html = render(input);
    expect(html).toContain('Número Familiar');
  });

  test('incluye sección de roles individuales', () => {
    const html = render(input);
    expect(html).toContain('El Rol de Cada Integrante');
  });

  test('incluye secciones de dinámica y fortalezas', () => {
    const html = render(input);
    expect(html).toContain('Dinámica Relacional');
    expect(html).toContain('Fortalezas Colectivas');
  });

  test('falla con menos de 2 miembros', () => {
    const badInput: TemplateInput = { ...input, members: [input.members[0]] };
    expect(() => render(badInput)).toThrow('at least 2 members');
  });

  test('números maestros visibles en los mapas individuales', () => {
    const html = render(input);
    // Padre tiene soul=11, karma=11, destiny=10
    expect(html.toLowerCase()).toContain('maestro');
  });
});

// ── Función render() genérica ─────────────────────────────────────────────────

describe('render() — función principal', () => {
  test('delega correctamente según type', () => {
    const personalInput: TemplateInput = {
      type: 'personal',
      members: [{
        firstName: 'Test', paternalSurname: 'User', maternalSurname: '',
        numbers: VERONICA_NUMBERS,
      }],
      content: BASE_CONTENT,
    };
    const html = render(personalInput);
    expect(html).toContain('Lectura Personal');
  });

  test('la fecha por defecto es now() si no se pasa generatedAt', () => {
    const input: TemplateInput = {
      type: 'personal',
      members: [{ firstName: 'Test', paternalSurname: 'U', maternalSurname: '', numbers: PADRE_NUMBERS }],
      content: BASE_CONTENT,
    };
    const html = render(input);
    // El año actual debe aparecer en el footer
    expect(html).toContain(String(new Date().getFullYear()));
  });
});

// ── Escape / seguridad ─────────────────────────────────────────────────────────

describe('seguridad — escape de contenido', () => {
  test('escapa HTML en el contenido de la lectura', () => {
    const maliciousInput: TemplateInput = {
      type: 'personal',
      members: [{ firstName: 'Test', paternalSurname: 'U', maternalSurname: '', numbers: VERONICA_NUMBERS }],
      content: {
        ...BASE_CONTENT,
        intro: '<script>alert("xss")</script>',
        soul:  '<img src=x onerror=alert(1)>',
      },
    };
    const html = render(maliciousInput);
    // Los tags HTML deben estar escapados como entidades — no ejecutables
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img ');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img');
  });
});
