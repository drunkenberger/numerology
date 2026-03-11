// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — Profile
// Muestra datos del usuario, créditos, y acceso a ajustes y cierre de sesión.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Alert, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { useAuth, useStore } from '../../src/stores/app.store';
import { supabase } from '../../src/services/supabase';
import { MONTH_NAMES } from '../../src/constants/labels';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS,
} from '../../src/constants/design';

const DEV_MODE = __DEV__;

export default function ProfileScreen() {
  const { profile, isPremium, readingCredits } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const fullName = profile
    ? `${profile.firstName} ${profile.paternalSurname} ${profile.maternalSurname}`.trim()
    : 'Viajero Cósmico';

  const birthStr = profile
    ? `${profile.birthDay} de ${MONTH_NAMES[profile.birthMonth - 1]} de ${profile.birthYear}`
    : '';

  async function handleLogout() {
    const doLogout = async () => {
      setLoggingOut(true);
      try {
        if (!DEV_MODE) {
          await supabase.auth.signOut();
        }
        useStore.getState().setSession(null);
        useStore.getState().setProfile(null);
        router.replace('/(auth)/login');
      } catch {
        if (Platform.OS === 'web') window.alert('Error al cerrar sesión.');
        else Alert.alert('Error', 'No se pudo cerrar sesión.');
        setLoggingOut(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Cerrar sesión?')) await doLogout();
    } else {
      Alert.alert('Cerrar sesión', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: doLogout },
      ]);
    }
  }

  return (
    <CosmicBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <Text style={styles.navBack}>‹ Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar + Name */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.firstName ?? 'J').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.fullName}>{fullName}</Text>
            {birthStr ? <Text style={styles.birthDate}>{birthStr}</Text> : null}
          </View>

          {/* Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Estado</Text>
              <Text style={[styles.statusValue, isPremium && { color: COLORS.success }]}>
                {isPremium ? '∞ Premium' : 'Gratuito'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Créditos</Text>
              <Text style={styles.statusValue}>
                {isPremium ? 'Ilimitados' : `${readingCredits}`}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push('/premium')}
            >
              <Text style={styles.actionIcon}>✦</Text>
              <Text style={styles.actionLabel}>
                {isPremium ? 'Gestionar suscripción' : 'Comprar lecturas'}
              </Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push('/history')}
            >
              <Text style={styles.actionIcon}>☰</Text>
              <Text style={styles.actionLabel}>Historial de lecturas</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <Text style={styles.logoutText}>
              {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </Text>
          </TouchableOpacity>

          {/* Dev badge */}
          {DEV_MODE && (
            <View style={styles.devBadge}>
              <Text style={styles.devText}>Modo desarrollo</Text>
            </View>
          )}

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
  navBack: { fontFamily: FONTS.body, fontSize: FONT_SIZE.base, color: COLORS.gold },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    letterSpacing: 2,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  content: { padding: SPACING.xl, gap: SPACING.xl },
  // ── Profile card
  profileCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.goldDim + '30',
    borderWidth: 1,
    borderColor: COLORS.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontFamily: FONTS.displayBold,
    fontSize: 34,
    color: COLORS.gold,
  },
  fullName: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  birthDate: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  // ── Status card
  statusCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: SPACING.md,
    ...SHADOWS.subtle,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  statusValue: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    color: COLORS.goldLight,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  // ── Actions card
  actionsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  actionIcon: { fontSize: 18, color: COLORS.gold, width: 24, textAlign: 'center' },
  actionLabel: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  actionArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  // ── Logout
  logoutBtn: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  logoutText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    letterSpacing: 0.5,
  },
  // ── Dev badge
  devBadge: {
    alignSelf: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.warning + '18',
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  devText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.warning,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
