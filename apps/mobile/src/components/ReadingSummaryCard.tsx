// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — ReadingSummaryCard
// Muestra el resumen rápido del mapa numerológico con CTA a lectura completa.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS,
  getNumberColor, isMaster,
} from '../constants/design';
import type { SummaryContent } from '../services/api';

interface ReadingSummaryCardProps {
  summary:      SummaryContent | null;
  loading:      boolean;
  error:        string | null;
  onGenerateFull: () => void;
  onRetry:      () => void;
  fullLoading:  boolean;
}

export function ReadingSummaryCard({
  summary, loading, error, onGenerateFull, onRetry, fullLoading,
}: ReadingSummaryCardProps) {
  // ── Loading state
  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.gold} size="small" />
          <Text style={styles.loadingText}>Consultando las estrellas...</Text>
        </View>
      </View>
    );
  }

  // ── Error state
  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── No summary yet
  if (!summary) return null;

  // ── Loaded state
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Resumen del Mapa</Text>

      {/* Intro */}
      <Text style={styles.introText}>{summary.intro}</Text>

      {/* Highlights */}
      <View style={styles.highlights}>
        {summary.highlights.map(h => {
          const color = getNumberColor(h.number);
          const master = isMaster(h.number);
          return (
            <View key={h.key} style={styles.highlightRow}>
              <View style={[styles.highlightDot, { backgroundColor: color + '25', borderColor: color + '50' }]}>
                <Text style={[styles.highlightNum, { color }]}>
                  {h.number}{master ? ' ✦' : ''}
                </Text>
              </View>
              <View style={styles.highlightInfo}>
                <Text style={[styles.highlightTitle, { color }]}>{h.title}</Text>
                <Text style={styles.highlightInsight}>{h.insight}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Current year */}
      <View style={styles.yearSection}>
        <Text style={styles.yearLabel}>Ciclo Actual</Text>
        <Text style={styles.yearText}>{summary.currentYear}</Text>
      </View>

      {/* Key theme */}
      <Text style={styles.keyTheme}>"{summary.keyTheme}"</Text>

      {/* CTA — Ver Lectura Completa */}
      <TouchableOpacity
        style={[styles.ctaBtn, fullLoading && styles.ctaBtnDisabled]}
        onPress={onGenerateFull}
        disabled={fullLoading}
        activeOpacity={0.8}
      >
        {fullLoading ? (
          <View style={styles.ctaLoadingRow}>
            <ActivityIndicator color={COLORS.textInverse} size="small" />
            <Text style={styles.ctaBtnText}>Generando lectura...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.ctaBtnText}>Ver Lectura Completa</Text>
            <Text style={styles.ctaBtnSub}>Interpretación profunda por Claude AI</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: SPACING.lg,
    ...SHADOWS.subtle,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  // ── Loading
  loadingContainer: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  // ── Error
  errorText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryBtn: {
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error + '50',
  },
  retryBtnText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
  },
  // ── Intro
  introText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  // ── Highlights
  highlights: {
    gap: SPACING.md,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  highlightDot: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  highlightNum: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  highlightInfo: {
    flex: 1,
    gap: 2,
  },
  highlightTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  highlightInsight: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // ── Year
  yearSection: {
    backgroundColor: COLORS.bgSection,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  yearLabel: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
  yearText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // ── Key theme
  keyTheme: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    color: COLORS.goldLight,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  // ── CTA
  ctaBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
    ...SHADOWS.gold,
  },
  ctaBtnDisabled: {
    opacity: 0.5,
  },
  ctaLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  ctaBtnText: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.base,
    color: COLORS.textInverse,
    letterSpacing: 1,
  },
  ctaBtnSub: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textInverse + 'aa',
    letterSpacing: 0.5,
  },
});
