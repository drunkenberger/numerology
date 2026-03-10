// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — Premium
// Paywall con los planes de suscripción via RevenueCat.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, StatusBar, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS,
} from '../../src/constants/design';

const FEATURES = [
  { icon: '◈', text: 'Lectura personal completa interpretada por Claude AI' },
  { icon: '⟺', text: 'Lectura de compatibilidad con análisis profundo' },
  { icon: '✦', text: 'Lectura familiar del núcleo completo' },
  { icon: '⬇', text: 'Exportar lecturas en HTML hermoso' },
  { icon: '☁', text: 'Historial de lecturas en la nube' },
  { icon: '∞', text: 'Integrantes ilimitados' },
] as const;

const PLANS = [
  { id: 'monthly', label: 'Mensual', price: '$4.99', period: '/mes',  badge: null,        save: null    },
  { id: 'yearly',  label: 'Anual',   price: '$29.99',period: '/año', badge: 'Más popular', save: '50% de ahorro' },
] as const;

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading,      setLoading]      = useState(false);

  async function handleSubscribe() {
    // En producción: Purchases.purchasePackage(pkg) de react-native-purchases
    // Aquí mostramos el flujo simulado / deeplink a settings
    setLoading(true);
    // TODO: integrar RevenueCat SDK
    // const offerings = await Purchases.getOfferings();
    // await Purchases.purchasePackage(offering.current.monthly);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    // Por ahora navegar de vuelta
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <CosmicBackground intensity="bright">
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Nav */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <Text style={styles.navClose}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroSymbol}>✦</Text>
            <Text style={styles.heroTitle}>Jyotish Premium</Text>
            <Text style={styles.heroSub}>
              Lecturas profundas interpretadas{'\n'}por inteligencia artificial
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresCard}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureDot}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Plans */}
          <View style={styles.plansRow}>
            {PLANS.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardActive,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.8}
              >
                {plan.badge && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <Text style={styles.planLabel}>{plan.label}</Text>
                <Text style={[
                  styles.planPrice,
                  selectedPlan === plan.id && styles.planPriceActive,
                ]}>
                  {plan.price}
                </Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
                {plan.save && (
                  <View style={styles.planSave}>
                    <Text style={styles.planSaveText}>{plan.save}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={COLORS.textInverse} size="small" />
              : <Text style={styles.ctaBtnText}>
                  Comenzar {selectedPlan === 'yearly' ? 'plan anual' : 'plan mensual'}
                </Text>
            }
          </TouchableOpacity>

          {/* Legal */}
          <Text style={styles.legalText}>
            Se renueva automáticamente. Cancela cuando quieras.{'\n'}
            Al suscribirte aceptas nuestros{' '}
            <Text
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://jyotish.app/terms')}
            >
              términos de servicio
            </Text>.
          </Text>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  nav: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'flex-end',
  },
  navClose: { fontSize: 20, color: COLORS.textMuted, padding: SPACING.sm },
  content: { padding: SPACING.xl, gap: SPACING.xxl },
  // ── Hero
  hero: { alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.lg },
  heroSymbol: {
    fontSize: 56,
    color: COLORS.gold,
    textShadowColor: COLORS.gold + '50',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZE.xxl,
    color: COLORS.goldLight,
    letterSpacing: 3,
    textShadowColor: COLORS.gold + '30',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroSub: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // ── Features
  featuresCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  featureDot: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.goldDim + '30',
    borderWidth: 1,
    borderColor: COLORS.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureIcon: { fontSize: 14, color: COLORS.gold },
  featureText: { fontFamily: FONTS.body, fontSize: FONT_SIZE.sm, color: COLORS.textPrimary, flex: 1, lineHeight: 20 },
  // ── Plans
  plansRow: { flexDirection: 'row', gap: SPACING.md },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    overflow: 'visible',
    position: 'relative',
  },
  planCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim + '20',
    ...SHADOWS.gold,
  },
  planBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  planBadgeText: { fontFamily: FONTS.display, fontSize: 9, letterSpacing: 1, color: COLORS.textInverse },
  planLabel: { fontFamily: FONTS.body, fontSize: FONT_SIZE.xs, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.textMuted },
  planPrice: { fontFamily: FONTS.displayBold, fontSize: FONT_SIZE.xxl, color: COLORS.textSecondary, letterSpacing: 0 },
  planPriceActive: { color: COLORS.goldLight },
  planPeriod: { fontFamily: FONTS.body, fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  planSave: {
    backgroundColor: COLORS.success + '25',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  planSaveText: { fontFamily: FONTS.body, fontSize: 9, color: COLORS.success, letterSpacing: 0.5 },
  // ── CTA
  ctaBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.gold,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnText: { fontFamily: FONTS.display, fontSize: FONT_SIZE.md, color: COLORS.textInverse, letterSpacing: 1.5 },
  // ── Legal
  legalText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: { color: COLORS.gold, textDecorationLine: 'underline' },
});
