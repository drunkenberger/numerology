// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — NumberOrb
// El orbe visual central de la app: muestra un número con su color, símbolo
// y glow. Usado en tarjetas, mapas y pantallas de lectura.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  COLORS, FONTS, FONT_SIZE, RADIUS, SPACING,
  getNumberColor, NUMBER_SYMBOLS, NUMBER_LABELS,
  isMaster, isSpecial,
} from '../constants/design';

interface NumberOrbProps {
  number:   number;
  label?:   string;          // ej. "Alma", "Destino"
  size?:    'sm' | 'md' | 'lg' | 'hero';
  showLabel?:  boolean;
  showSymbol?: boolean;
  showBadge?:  boolean;
  style?:   ViewStyle;
}

const SIZES = {
  sm:   { orb: 48,  num: 18, sym: 10, lbl: 9  },
  md:   { orb: 72,  num: 26, sym: 13, lbl: 10 },
  lg:   { orb: 96,  num: 34, sym: 16, lbl: 11 },
  hero: { orb: 140, num: 50, sym: 22, lbl: 12 },
} as const;

export function NumberOrb({
  number, label, size = 'md',
  showLabel = true, showSymbol = true, showBadge = true,
  style,
}: NumberOrbProps) {
  const color  = getNumberColor(number);
  const symbol = NUMBER_SYMBOLS[number] ?? '◆';
  const dims   = SIZES[size];
  const master = isMaster(number);
  const special = isSpecial(number);

  return (
    <View style={[styles.wrapper, style]}>
      {/* Glow layer */}
      <View style={[
        styles.glow,
        { width: dims.orb * 1.6, height: dims.orb * 1.6, borderRadius: dims.orb,
          backgroundColor: color + '18' },
      ]} />

      {/* Orb */}
      <View style={[
        styles.orb,
        { width: dims.orb, height: dims.orb, borderRadius: dims.orb,
          borderColor: color + '70',
          backgroundColor: COLORS.bgCard,
        },
        master  && { borderColor: color, borderWidth: 1.5 },
        special && { borderColor: color + 'aa' },
      ]}>
        {showSymbol && (
          <Text style={[styles.symbol, { fontSize: dims.sym, color: color + 'aa' }]}>
            {symbol}
          </Text>
        )}
        <Text style={[
          styles.number,
          { fontSize: dims.num, color: master ? COLORS.goldLight : color },
          master && styles.masterNumber,
        ]}>
          {number}{master ? ' ✦' : special ? ' ◉' : ''}
        </Text>
      </View>

      {/* Labels */}
      {showLabel && label && (
        <Text style={[styles.label, { fontSize: dims.lbl }]}>{label}</Text>
      )}

      {showBadge && master && (
        <View style={[styles.badge, { borderColor: color + '60', backgroundColor: color + '18' }]}>
          <Text style={[styles.badgeText, { color: COLORS.goldLight }]}>MAESTRO</Text>
        </View>
      )}
      {showBadge && special && (
        <View style={[styles.badge, { borderColor: COLORS.n2 + '60', backgroundColor: COLORS.n2 + '18' }]}>
          <Text style={[styles.badgeText, { color: COLORS.n2 }]}>ESPECIAL</Text>
        </View>
      )}

      {showLabel && (
        <Text style={[styles.sublabel, { fontSize: dims.lbl - 1 }]}>
          {NUMBER_LABELS[number] ?? ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  glow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -30 }],
  },
  orb: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  number: {
    fontFamily: FONTS.display,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: undefined,
  },
  masterNumber: {
    textShadowColor: COLORS.gold + '60',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  symbol: {
    fontFamily: FONTS.body,
    opacity: 0.7,
  },
  label: {
    fontFamily: FONTS.body,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sublabel: {
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginTop: 2,
  },
  badgeText: {
    fontFamily: FONTS.body,
    fontSize: 8,
    letterSpacing: 1.5,
  },
});
