// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — ReadingHistoryCard
// Tarjeta para el historial de lecturas con tipo, nombres, fecha y resumen.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS } from '../constants/design';
import type { ReadingListItem } from '../services/api';

const TYPE_CONFIG = {
  personal:      { icon: '◈', label: 'Personal',       color: COLORS.gold },
  compatibility: { icon: '⟺', label: 'Compatibilidad', color: '#C97B8A' },
  family:        { icon: '✦', label: 'Familiar',       color: COLORS.violet },
} as const;

const INTERP_CONFIG = {
  hindu:       { label: 'Hindu',      color: '#E8A04A' },
  pythagorean: { label: 'Pitagórica', color: '#90CAF9' },
} as const;

function formatReadingDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre',
  ];
  return `${day} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

interface Props {
  item: ReadingListItem;
  onPress: () => void;
  onDelete?: () => void;
}

export function ReadingHistoryCard({ item, onPress, onDelete }: Props) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.personal;
  const interp = INTERP_CONFIG[item.interpretation] ?? INTERP_CONFIG.hindu;
  const names = item.type === 'compatibility'
    ? item.memberNames.join(' y ')
    : item.memberNames.join(', ');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.typeIndicator, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '40' }]}>
        <Text style={[styles.typeIcon, { color: cfg.color }]}>{cfg.icon}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.labelsRow}>
            <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <View style={[styles.interpBadge, { backgroundColor: interp.color + '18', borderColor: interp.color + '40' }]}>
              <Text style={[styles.interpBadgeText, { color: interp.color }]}>{interp.label}</Text>
            </View>
          </View>
          <Text style={styles.date}>{formatReadingDate(item.createdAt)}</Text>
        </View>
        {names ? <Text style={styles.names}>{names}</Text> : null}
        {item.summary ? (
          <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
        ) : null}
      </View>
      {onDelete ? (
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); onDelete(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  typeIndicator: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIcon: { fontSize: 18 },
  body: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  interpBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  interpBadgeText: {
    fontFamily: FONTS.body,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  typeLabel: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  date: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  names: {
    fontFamily: FONTS.bodyRegular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  summary: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  chevron: {
    fontFamily: FONTS.body,
    fontSize: 20,
    color: COLORS.textMuted,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '18',
  },
  deleteIcon: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
});
