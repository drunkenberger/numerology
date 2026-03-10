// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — Home
// Dashboard principal: saludo, mis integrantes, accesos rápidos.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { MemberCard } from '../../src/components/MemberCard';
import { useMembers } from '../../src/hooks/useMembers';
import { useAuth } from '../../src/stores/app.store';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS,
} from '../../src/constants/design';

const QUICK_ACTIONS = [
  { id: 'compatibility', icon: '⟺', label: 'Compatibilidad',        route: '/generate?type=compatibility' as const },
  { id: 'family',        icon: '✦', label: 'Lectura Familiar',      route: '/generate?type=family'        as const },
  { id: 'history',       icon: '☰', label: 'Historial',             route: '/history'                     as const },
  { id: 'add',           icon: '+', label: 'Agregar Integrante',    route: '/member/new'                  as const },
] as const;

export default function HomeScreen() {
  const { profile, isPremium } = useAuth();
  const { members, loading, refresh } = useMembers();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleMemberPress = useCallback((id: string) => {
    router.push(`/member/${id}` as any);
  }, []);

  return (
    <CosmicBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={COLORS.gold}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>
                {profile?.firstName ?? 'Viajero Cósmico'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.settingsIcon}>☽</Text>
            </TouchableOpacity>
          </View>

          {/* TODO: Premium banner — re-enable for production */}

          {/* Acciones rápidas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lecturas y acciones</Text>
            <View style={styles.actionsGrid}>
              {QUICK_ACTIONS.map(action => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Integrantes */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>
                {members.length === 0 ? 'Familia & Círculo' : `Mi Círculo (${members.length})`}
              </Text>
              <TouchableOpacity onPress={() => router.push('/member/new')}>
                <Text style={styles.sectionAction}>+ Agregar</Text>
              </TouchableOpacity>
            </View>

            {members.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>◎</Text>
                <Text style={styles.emptyTitle}>Agrega a tus seres queridos</Text>
                <Text style={styles.emptyBody}>
                  Crea perfiles para tu pareja, hijos, padres{'\n'}y descubre sus mapas numerológicos.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/member/new')}
                >
                  <Text style={styles.emptyBtnText}>Agregar primer integrante</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.membersList}>
                {members.map(m => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    onPress={() => handleMemberPress(m.id)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Bottom padding */}
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.xl,
    gap: SPACING.xxl,
  },
  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: SPACING.md,
  },
  greeting: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userName: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZE.xxl,
    color: COLORS.goldLight,
    letterSpacing: 1,
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
  },
  settingsIcon: {
    fontSize: 20,
    color: COLORS.gold,
  },
  // ── Premium banner
  premiumBanner: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.goldDim,
    ...SHADOWS.gold,
  },
  premiumBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.goldDim + '30',
  },
  premiumIcon: {
    fontSize: 24,
    color: COLORS.gold,
  },
  premiumTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    color: COLORS.goldLight,
    letterSpacing: 0.5,
  },
  premiumSub: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  premiumArrow: {
    fontSize: 24,
    color: COLORS.gold,
    fontFamily: FONTS.body,
  },
  // ── Sections
  section: {
    gap: SPACING.lg,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  sectionAction: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    letterSpacing: 1,
  },
  // ── Quick actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.subtle,
  },
  actionIcon: {
    fontSize: 28,
    color: COLORS.gold,
  },
  actionLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  // ── Members list
  membersList: {
    gap: SPACING.md,
  },
  // ── Empty state
  emptyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xxxl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyIcon: {
    fontSize: 48,
    color: COLORS.textMuted,
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
  },
  emptyBtnText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    letterSpacing: 1,
  },
});
