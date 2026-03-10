// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — Member Detail
// Perfil numerológico + resumen AI auto-generado + CTA a lectura completa.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground } from '../../../src/components/CosmicBackground';
import { NumerologyMap } from '../../../src/components/NumerologyMap';
import { ReadingSummaryCard } from '../../../src/components/ReadingSummaryCard';
import { useMembers } from '../../../src/hooks/useMembers';
import { useStore } from '../../../src/stores/app.store';
import { api, APIError } from '../../../src/services/api';
import type { SummaryContent } from '../../../src/services/api';
import { calculateMap } from '@jyotish/numerology';
import { RELATION_LABELS, MONTH_NAMES } from '../../../src/constants/labels';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS,
  getNumberColor, NUMBER_LABELS, NUMBER_SYMBOLS, isMaster, isSpecial,
} from '../../../src/constants/design';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { members, deleteMember } = useMembers();
  const [deleting, setDeleting] = useState(false);

  // ── Summary state
  const [summary, setSummary]           = useState<SummaryContent | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [fullLoading, setFullLoading]   = useState(false);

  const member = members.find(m => m.id === id);

  // Siempre recalcular — el mapa depende de la fecha actual (año personal)
  const numbers = (() => {
    if (!member) return null;
    try {
      return calculateMap({
        firstName:       member.firstName,
        paternalSurname: member.paternalSurname,
        maternalSurname: member.maternalSurname,
        birthDate: {
          day:   member.birthDay,
          month: member.birthMonth,
          year:  member.birthYear,
        },
      });
    } catch { return null; }
  })();

  // ── Auto-fetch summary on mount
  const fetchSummary = useCallback(async () => {
    if (!id || !numbers) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const result = await api.generateSummary('personal', [id]);
      setSummary(result.content);
    } catch (err) {
      const msg = err instanceof APIError ? err.message : 'Error al generar el resumen.';
      setSummaryError(msg);
    } finally {
      setSummaryLoading(false);
    }
  }, [id, numbers?.destiny]);

  useEffect(() => {
    if (numbers) void fetchSummary();
  }, [fetchSummary]);

  // ── Loading / not found
  if (!member) {
    return (
      <CosmicBackground>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.gold} size="large" />
        </View>
      </CosmicBackground>
    );
  }

  const { firstName, paternalSurname, maternalSurname, birthDay, birthMonth, birthYear, relation } = member;
  const fullName = `${firstName} ${paternalSurname} ${maternalSurname}`.trim();
  const birthStr = `${birthDay} de ${MONTH_NAMES[birthMonth - 1]} de ${birthYear}`;
  const accentColor = numbers ? getNumberColor(numbers.destiny) : COLORS.gold;

  async function handleDelete() {
    const doDelete = async () => {
      setDeleting(true);
      try {
        await deleteMember(id);
        if (router.canGoBack()) router.back();
        else router.replace('/');
      } catch {
        if (Platform.OS === 'web') window.alert('No se pudo eliminar el integrante.');
        else Alert.alert('Error', 'No se pudo eliminar el integrante.');
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar a ${firstName}? Esta acción no se puede deshacer.`)) {
        await doDelete();
      }
    } else {
      Alert.alert(
        'Eliminar integrante',
        `¿Eliminar a ${firstName}? Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  }

  async function handleGenerateFull() {
    setFullLoading(true);
    try {
      const result = await api.generateReading('personal', [id]);

      useStore.getState().addReading({
        id: result.readingId,
        type: result.type,
        memberIds: [id],
        content: result.content,
        htmlUrl: result.htmlUrl,
        cached: result.cached,
        createdAt: new Date().toISOString(),
      });

      router.push({
        pathname: `/reading/${result.readingId}`,
        params: {
          readingId:   result.readingId,
          type:        result.type,
          htmlUrl:     result.htmlUrl ?? '',
          memberNames: firstName,
        },
      } as any);
    } catch (err) {
      if (err instanceof APIError && err.isPremiumRequired) {
        router.push('/premium');
        return;
      }
      Alert.alert('Error', 'No se pudo generar la lectura completa.');
    } finally {
      setFullLoading(false);
    }
  }

  return (
    <CosmicBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Nav */}
          <View style={styles.nav}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
              <Text style={styles.navBack}>‹ Atrás</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} disabled={deleting}>
              {deleting
                ? <ActivityIndicator color={COLORS.error} size="small" />
                : <Text style={styles.deleteBtn}>Eliminar</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Perfil header */}
          <View style={styles.profileHeader}>
            <View style={[
              styles.avatar,
              { borderColor: accentColor + '80', backgroundColor: accentColor + '15' },
            ]}>
              {numbers ? (
                <>
                  <Text style={[styles.avatarSymbol, { color: accentColor + '90' }]}>
                    {NUMBER_SYMBOLS[numbers.destiny] ?? '◆'}
                  </Text>
                  <Text style={[styles.avatarNumber, { color: accentColor }]}>
                    {numbers.destiny}{isMaster(numbers.destiny) ? ' ✦' : isSpecial(numbers.destiny) ? ' ◉' : ''}
                  </Text>
                  <Text style={[styles.avatarLabel, { color: accentColor + 'aa' }]}>
                    {NUMBER_LABELS[numbers.destiny] ?? ''}
                  </Text>
                </>
              ) : (
                <Text style={styles.avatarInitial}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <Text style={styles.fullName}>{fullName}</Text>
            <Text style={styles.relation}>{RELATION_LABELS[relation] ?? relation}</Text>
            <Text style={styles.birthDate}>{birthStr}</Text>
          </View>

          {/* Mapa numerológico */}
          {numbers ? (
            <View style={styles.mapCard}>
              <Text style={styles.mapTitle}>Mapa Numerológico</Text>
              <NumerologyMap numbers={numbers} />
            </View>
          ) : (
            <View style={styles.noMapCard}>
              <Text style={styles.noMapText}>
                No se pudieron calcular los números.{'\n'}
                Verifica que el nombre y fecha sean correctos.
              </Text>
            </View>
          )}

          {/* Summary card — auto-generated */}
          {numbers && (
            <ReadingSummaryCard
              summary={summary}
              loading={summaryLoading}
              error={summaryError}
              onGenerateFull={handleGenerateFull}
              onRetry={fetchSummary}
              fullLoading={fullLoading}
            />
          )}

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACING.xl, gap: SPACING.xl },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  navBack: { fontFamily: FONTS.body, fontSize: FONT_SIZE.base, color: COLORS.gold },
  deleteBtn: { fontFamily: FONTS.body, fontSize: FONT_SIZE.sm, color: COLORS.error },
  // ── Profile header
  profileHeader: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginBottom: SPACING.sm,
  },
  avatarSymbol: { fontFamily: FONTS.body, fontSize: 12 },
  avatarNumber: {
    fontFamily: FONTS.displayBold,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 36,
  },
  avatarLabel: { fontFamily: FONTS.body, fontSize: 9, letterSpacing: 0.5 },
  avatarInitial: { fontFamily: FONTS.displayBold, fontSize: 44, color: COLORS.textSecondary },
  fullName: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  relation: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  birthDate: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  // ── Map card
  mapCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: SPACING.lg,
    ...SHADOWS.subtle,
  },
  mapTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  noMapCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  noMapText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
