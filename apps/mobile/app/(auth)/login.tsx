// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — Login
// Autenticación vía magic link (email) de Supabase.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../src/services/supabase';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS,
} from '../../src/constants/design';

export default function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleMagicLink() {
    if (!email.trim()) { setError('Ingresa tu correo electrónico'); return; }
    setLoading(true);
    setError(null);

    const redirectTo = Platform.OS === 'web'
      ? window.location.origin
      : 'jyotish://auth/callback';

    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    setLoading(false);
    if (err) { setError(err.message); }
    else      { setSent(true); }
  }

  if (sent) {
    return (
      <CosmicBackground>
        <View style={styles.sentContainer}>
          <Text style={styles.sentIcon}>✉️</Text>
          <Text style={styles.sentTitle}>Revisa tu correo</Text>
          <Text style={styles.sentBody}>
            Te enviamos un enlace mágico a{'\n'}
            <Text style={styles.sentEmail}>{email}</Text>
          </Text>
          <TouchableOpacity onPress={() => setSent(false)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Usar otro correo</Text>
          </TouchableOpacity>
        </View>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <Text style={styles.logoSymbol}>☽ ✦ ☉</Text>
            <Text style={styles.logoTitle}>Jyotish</Text>
            <Text style={styles.logoSubtitle}>NUMEROLOGÍA</Text>
          </View>

          {/* Tagline */}
          <Text style={styles.tagline}>
            Descubre el mapa cósmico{'\n'}que guía tu vida
          </Text>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Acceder</Text>
            <Text style={styles.formSubtitle}>
              Te enviamos un enlace mágico — sin contraseña
            </Text>

            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="tu@correo.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={t => { setEmail(t); setError(null); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={handleMagicLink}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleMagicLink}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color={COLORS.textInverse} size="small" />
                : <Text style={styles.btnText}>Enviar enlace mágico</Text>
              }
            </TouchableOpacity>

            <Text style={styles.legalText}>
              Al continuar aceptas que tus lecturas son{'\n'}de carácter personal y espiritual
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    gap: SPACING.xxl,
  },
  logoArea: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  logoSymbol: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xl,
    color: COLORS.gold,
    letterSpacing: 12,
  },
  logoTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZE.hero,
    color: COLORS.goldLight,
    letterSpacing: 4,
    textShadowColor: COLORS.gold + '40',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  logoSubtitle: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 8,
    color: COLORS.textMuted,
  },
  tagline: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  formCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
    padding: SPACING.xxl,
    gap: SPACING.lg,
    ...SHADOWS.gold,
  },
  formTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.lg,
    color: COLORS.goldLight,
    letterSpacing: 2,
    textAlign: 'center',
  },
  formSubtitle: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    backgroundColor: COLORS.bgSection,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontFamily: FONTS.bodyRegular,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  inputError: {
    borderColor: COLORS.error + '80',
  },
  errorText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.gold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.base,
    color: COLORS.textInverse,
    letterSpacing: 1.5,
  },
  legalText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  // ── Sent state
  sentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
    gap: SPACING.xl,
  },
  sentIcon: {
    fontSize: 64,
  },
  sentTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.xl,
    color: COLORS.goldLight,
    letterSpacing: 2,
    textAlign: 'center',
  },
  sentBody: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  sentEmail: {
    color: COLORS.gold,
    fontFamily: FONTS.bodyRegular,
  },
  backBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
  },
  backBtnText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
});
