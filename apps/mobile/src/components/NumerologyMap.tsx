// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — NumerologyMap
// Grid 3×2 con los 6 números del mapa de una persona.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS } from '../constants/design';
import { NumberOrb } from './NumberOrb';
import type { MemberNumbers } from '../stores/app.store';

interface NumerologyMapProps {
  numbers:  MemberNumbers;
  name?:    string;
  compact?: boolean;
  style?:   ViewStyle;
}

const MAP_ENTRIES = [
  { key: 'soul'        as const, label: 'Alma'         },
  { key: 'personality' as const, label: 'Regalo'       },
  { key: 'karma'       as const, label: 'Karma'        },
  { key: 'destiny'     as const, label: 'Destino'      },
  { key: 'mission'     as const, label: 'Misión'       },
  { key: 'personalYear'as const, label: 'Año Personal' },
];

export function NumerologyMap({ numbers, name, compact = false, style }: NumerologyMapProps) {
  const orbSize = compact ? 'sm' : 'md';

  return (
    <View style={[styles.container, style]}>
      {name && (
        <Text style={styles.name}>{name}</Text>
      )}
      <View style={[styles.grid, compact && styles.gridCompact]}>
        {MAP_ENTRIES.map(({ key, label }) => (
          <View key={key} style={[styles.cell, compact && styles.cellCompact]}>
            <NumberOrb
              number={numbers[key]}
              label={label}
              size={orbSize}
              showLabel
              showSymbol={!compact}
              showBadge={!compact}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  name: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.gold,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  gridCompact: {
    gap: SPACING.sm,
  },
  cell: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cellCompact: {
    width: '28%',
    paddingVertical: SPACING.sm,
  },
});
