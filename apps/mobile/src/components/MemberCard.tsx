// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — MemberCard
// Tarjeta compacta de un integrante familiar con número y línea de números.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS,
  getNumberColor, NUMBER_SYMBOLS, isMaster,
} from '../constants/design';
import { RELATION_LABELS } from '../constants/labels';
import type { FamilyMember } from '../stores/app.store';

interface MemberCardProps {
  member:    FamilyMember;
  onPress?:  () => void;
  selected?: boolean;
  style?:    ViewStyle;
}

export function MemberCard({ member, onPress, selected, style }: MemberCardProps) {
  const { firstName, paternalSurname, relation, numbers } = member;
  const destiny = numbers?.destiny;
  const accentColor = destiny ? getNumberColor(destiny) : COLORS.gold;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.card,
        selected && { borderColor: accentColor, backgroundColor: accentColor + '12' },
        style,
      ]}
    >
      <View style={styles.content}>
        {/* Avatar — número o inicial */}
        <View style={[
          styles.avatar,
          { borderColor: accentColor + '60', backgroundColor: accentColor + '15' },
        ]}>
          {destiny ? (
            <>
              <Text style={[styles.avatarSymbol, { color: accentColor + '90' }]}>
                {NUMBER_SYMBOLS[destiny] ?? '◆'}
              </Text>
              <Text style={[styles.avatarNumber, { color: accentColor }]}>
                {destiny}
              </Text>
            </>
          ) : (
            <Text style={styles.avatarInitial}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {firstName} {paternalSurname}
          </Text>
          <Text style={styles.relation}>
            {RELATION_LABELS[relation] ?? relation}
          </Text>
          {numbers && <NumbersLine numbers={numbers} />}
        </View>

        {/* Chevron o checkmark */}
        {selected ? (
          <View style={[styles.check, { backgroundColor: accentColor }]}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        ) : onPress ? (
          <Text style={[styles.chevron, { color: accentColor + '60' }]}>›</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ── Línea de números legible ────────────────────────────────────────────────

function NumbersLine({ numbers }: { numbers: NonNullable<FamilyMember['numbers']> }) {
  const items = [
    { label: 'Alma', value: numbers.soul },
    { label: 'Destino', value: numbers.destiny },
    { label: 'Misión', value: numbers.mission },
  ];

  return (
    <Text style={styles.numbersLine}>
      {items.map((item, i) => (
        <Text key={item.label}>
          {i > 0 && <Text style={styles.numbersSep}> · </Text>}
          <Text style={styles.numbersLabel}>{item.label} </Text>
          <Text style={[
            styles.numbersValue,
            { color: getNumberColor(item.value) },
          ]}>
            {item.value}{isMaster(item.value) ? ' ✦' : ''}
          </Text>
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  // ── Avatar inline (sin glow, sin posición absoluta)
  avatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarSymbol: {
    fontFamily: FONTS.body,
    fontSize: 9,
  },
  avatarNumber: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  avatarInitial: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  // ── Info
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  relation: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // ── Numbers line
  numbersLine: {
    marginTop: 4,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
  },
  numbersLabel: {
    color: COLORS.textMuted,
  },
  numbersValue: {
    fontFamily: FONTS.display,
    fontWeight: '700',
  },
  numbersSep: {
    color: COLORS.textMuted,
  },
  // ── Actions
  chevron: {
    fontSize: 24,
    fontFamily: FONTS.body,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: COLORS.bgDeep,
    fontSize: 12,
    fontWeight: '700',
  },
});
