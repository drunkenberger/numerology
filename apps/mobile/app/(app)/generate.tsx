// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — Generate Reading
// Selecciona integrantes → llama al API → navega a Reading screen.
// Tipo viene del route param (compatibility/family). Personal va por member detail.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { MemberCard } from '../../src/components/MemberCard';
import { useMembers } from '../../src/hooks/useMembers';
import { useAuth, useStore } from '../../src/stores/app.store';
import { api, APIError } from '../../src/services/api';
import type { Interpretation } from '../../src/services/api';
import { InterpretationInfo } from '../../src/components/InterpretationInfo';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS,
} from '../../src/constants/design';

type ReadingType = 'personal' | 'compatibility' | 'family';

const TYPE_CONFIG = {
  personal: {
    icon:    '◈',
    title:   'Lectura Personal',
    desc:    'El mapa completo de un integrante — alma, karma, destino y misión.',
    min: 1, max: 1,
  },
  compatibility: {
    icon:    '⟺',
    title:   'Compatibilidad',
    desc:    'La dinámica entre dos personas — resonancias, desafíos y potencial.',
    min: 2, max: 2,
  },
  family: {
    icon:    '✦',
    title:   'Lectura Familiar',
    desc:    'El núcleo familiar como unidad — dinámica colectiva y misión compartida.',
    min: 2, max: 8,
  },
} as const;

export default function GenerateReadingScreen() {
  const params = useLocalSearchParams<{ type?: ReadingType; preselected?: string }>();
  const rawType = params.type as string | undefined;
  const type: ReadingType = (rawType === 'personal' || rawType === 'compatibility' || rawType === 'family')
    ? rawType
    : 'compatibility';

  const { isPremium } = useAuth();
  const { members }   = useMembers();

  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [selected, setSelected] = useState<string[]>(
    params.preselected ? [params.preselected] : []
  );
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const cfg = TYPE_CONFIG[type];

  function toggleMember(id: string) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= cfg.max) {
        // Para personal/compat reemplaza la selección, para family agrega
        if (cfg.max === 1) return [id];
        if (cfg.max === 2) return [prev[1] ?? id, id].slice(0, 2);
        return [...prev, id];
      }
      return [...prev, id];
    });
  }

  const canGenerate = interpretation !== null && selected.length >= cfg.min && selected.length <= cfg.max;

  async function handleGenerate() {
    if (!canGenerate) return;
    // TODO: re-enable premium check for production
    // if (!isPremium) { router.push('/premium'); return; }

    setLoading(true);
    setError(null);

    try {
      const result = await api.generateReading(type, interpretation!, selected);
      const memberNames = members
        .filter(m => selected.includes(m.id))
        .map(m => m.firstName)
        .join(' & ');

      useStore.getState().addReading({
        id: result.readingId,
        type: result.type,
        interpretation: result.interpretation,
        memberIds: selected,
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
          memberNames,
        },
      } as any);
    } catch (err) {
      if (err instanceof APIError) {
        if (err.isPremiumRequired) { router.push('/premium'); return; }
        setError(err.message);
      } else {
        setError('Error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <CosmicBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header fijo */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <Text style={styles.navBack}>‹ Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{cfg.title}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Descripción del tipo */}
          <Text style={styles.typeDesc}>{cfg.desc}</Text>

          {/* Selección de interpretación */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Marco interpretativo</Text>
            <View style={styles.interpRow}>
              <TouchableOpacity
                style={[
                  styles.interpCard,
                  interpretation === 'hindu' && styles.interpCardActive,
                  interpretation === 'hindu' && { borderColor: '#E8A04A40' },
                ]}
                onPress={() => setInterpretation('hindu')}
                activeOpacity={0.7}
              >
                <Text style={[styles.interpIcon, { color: '#E8A04A' }]}>☸</Text>
                <Text style={[
                  styles.interpTitle,
                  interpretation === 'hindu' && { color: '#E8A04A' },
                ]}>Hindu</Text>
                <Text style={styles.interpDesc}>Karma, dharma y evolución del alma</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.interpCard,
                  interpretation === 'pythagorean' && styles.interpCardActive,
                  interpretation === 'pythagorean' && { borderColor: '#90CAF940' },
                ]}
                onPress={() => setInterpretation('pythagorean')}
                activeOpacity={0.7}
              >
                <Text style={[styles.interpIcon, { color: '#90CAF9' }]}>△</Text>
                <Text style={[
                  styles.interpTitle,
                  interpretation === 'pythagorean' && { color: '#90CAF9' },
                ]}>Pitagórica</Text>
                <Text style={styles.interpDesc}>Vibraciones, camino de vida y expresión</Text>
              </TouchableOpacity>
            </View>
            <InterpretationInfo />
          </View>

          {/* Selección de integrantes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Seleccionar {cfg.min === cfg.max ? `${cfg.min} integrante${cfg.min > 1 ? 's' : ''}` : `${cfg.min}–${cfg.max} integrantes`}
              {' '}({selected.length}/{cfg.max})
            </Text>

            {members.length === 0 ? (
              <View style={styles.noMembersCard}>
                <Text style={styles.noMembersText}>
                  Agrega integrantes desde la pantalla principal para poder generar lecturas.
                </Text>
                <TouchableOpacity
                  style={styles.addMemberBtn}
                  onPress={() => router.push('/member/new')}
                >
                  <Text style={styles.addMemberBtnText}>+ Agregar integrante</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.membersList}>
                {members.map(m => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    selected={selected.includes(m.id)}
                    onPress={() => toggleMember(m.id)}
                  />
                ))}
              </View>
            )}
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[
              styles.generateBtn,
              (!canGenerate || loading) && styles.generateBtnDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!canGenerate || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={COLORS.textInverse} size="small" />
                <Text style={styles.generateBtnText}>Consultando el cosmos…</Text>
              </View>
            ) : (
              <>
                <Text style={styles.generateBtnText}>
                  {`Generar ${cfg.title}`}
                </Text>
                <Text style={styles.generateBtnSub}>Interpretado por Claude AI</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navBack: { fontFamily: FONTS.body, fontSize: FONT_SIZE.base, color: COLORS.gold, letterSpacing: 0.5 },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    letterSpacing: 2,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  content: { padding: SPACING.xl, gap: SPACING.xxl },
  section: { gap: SPACING.md },
  sectionLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
  typeDesc: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // ── Interpretation selector
  interpRow: { flexDirection: 'row', gap: SPACING.sm },
  interpCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  interpCardActive: {
    backgroundColor: COLORS.bgSection,
  },
  interpIcon: { fontSize: 24 },
  interpTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  interpDesc: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
  // ── Members
  membersList: { gap: SPACING.sm },
  noMembersCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.lg,
  },
  noMembersText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  addMemberBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
  },
  addMemberBtnText: { fontFamily: FONTS.body, fontSize: FONT_SIZE.sm, color: COLORS.gold },
  // ── Error
  errorCard: {
    backgroundColor: COLORS.error + '18',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
    padding: SPACING.lg,
  },
  errorText: { fontFamily: FONTS.body, fontSize: FONT_SIZE.sm, color: COLORS.error, textAlign: 'center' },
  // ── CTA
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  generateBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.xs,
    ...SHADOWS.gold,
  },
  generateBtnDisabled: { opacity: 0.4, ...SHADOWS.subtle },
  generateBtnText: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.base,
    color: COLORS.textInverse,
    letterSpacing: 1.5,
  },
  generateBtnSub: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textInverse + 'aa',
    letterSpacing: 1,
  },
});
