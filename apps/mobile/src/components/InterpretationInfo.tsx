// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — InterpretationInfo
// Card colapsable que explica las diferencias entre Hindu y Pitagórica.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS,
} from '../constants/design';

export function InterpretationInfo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {expanded ? '▾' : '▸'} ¿Cuál es la diferencia?
        </Text>
      </View>

      {expanded && (
        <View style={styles.body}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: '#E8A04A' }]}>Hindu / Jyotish</Text>
            <Text style={styles.desc}>
              Interpreta los números desde el marco kármico y dhármico de la tradición hindú.
              Se enfoca en la evolución del alma, las lecciones kármicas de vidas pasadas,
              el dharma (propósito sagrado) y el ciclo de samsara.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: '#90CAF9' }]}>Pitagórica</Text>
            <Text style={styles.desc}>
              Interpreta desde el marco vibracional occidental. Se enfoca en las
              frecuencias numéricas, el camino de vida, la expresión de talentos
              y el potencial práctico aplicable al día a día.
            </Text>
          </View>

          <View style={styles.complementSection}>
            <Text style={styles.complementTitle}>Se complementan</Text>
            <Text style={styles.desc}>
              Ambas usan los mismos números calculados — solo cambia el lente
              interpretativo. Generar ambas te da una visión más completa.
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  section: { gap: SPACING.xs },
  label: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  desc: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  complementSection: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xs,
  },
  complementTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
});
