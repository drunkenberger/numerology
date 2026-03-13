// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — Premium / Paywall
// 3 opciones: $1/lectura, $7/10 lecturas, $10/mes ilimitado
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { useAuth, useStore } from '../../src/stores/app.store';
import { api } from '../../src/services/api';
import { PRODUCTS, purchaseProduct } from '../../src/services/purchases';
import type { PurchaseProduct } from '../../src/services/purchases';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS,
} from '../../src/constants/design';

const PLAN_ICONS: Record<string, string> = {
  jyotish_single_reading: '◈',
  jyotish_bundle_10:      '✦',
  jyotish_monthly:        '∞',
};

const PLAN_DESCS: Record<string, string> = {
  jyotish_single_reading: 'Ideal para probar una lectura personal, de compatibilidad o familiar.',
  jyotish_bundle_10:      'Ahorra 30% — perfecto para explorar varias lecturas.',
  jyotish_monthly:        'Lecturas ilimitadas para ti y tu familia.',
};

export default function PremiumScreen() {
  const { isPremium, readingCredits } = useAuth();
  const [selected, setSelected] = useState<string>('jyotish_bundle_10');
  const [loading, setLoading]   = useState(false);

  // Refrescar créditos al entrar
  useEffect(() => {
    api.getCredits()
      .then(data => {
        useStore.getState().setCredits(data.readingCredits);
        if (data.isPremium) {
          useStore.getState().setProfile({
            ...useStore.getState().profile!,
            isPremium: true,
            readingCredits: data.readingCredits,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handlePurchase() {
    const product = PRODUCTS.find(p => p.id === selected);
    if (!product) return;

    setLoading(true);
    try {
      const success = await purchaseProduct(product.id);
      if (success) {
        // Refrescar créditos desde el backend
        const data = await api.getCredits();
        useStore.getState().setCredits(data.readingCredits);

        const msg = product.type === 'subscription'
          ? 'Tu suscripción premium está activa.'
          : `+${product.credits} crédito${product.credits > 1 ? 's' : ''} agregado${product.credits > 1 ? 's' : ''}.`;

        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Compra exitosa', msg);
        }

        if (router.canGoBack()) router.back();
        else router.replace('/');
      }
    } catch {
      const errorMsg = 'No se pudo completar la compra. Intenta de nuevo.';
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <CosmicBackground intensity="bright">
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
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
            <Text style={styles.heroTitle}>Lecturas Profundas</Text>
            <Text style={styles.heroSub}>
              Interpretaciones detalladas{'\n'}generadas por inteligencia artificial
            </Text>
          </View>

          {/* Credits badge */}
          {readingCredits > 0 && !isPremium && (
            <View style={styles.creditsBadge}>
              <Text style={styles.creditsText}>
                Tienes {readingCredits} crédito{readingCredits !== 1 ? 's' : ''} disponible{readingCredits !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>∞ Suscripción Premium Activa</Text>
            </View>
          )}

          {/* Plans */}
          <View style={styles.plansCol}>
            {PRODUCTS.map(product => (
              <PlanCard
                key={product.id}
                product={product}
                icon={PLAN_ICONS[product.id] ?? '◆'}
                desc={PLAN_DESCS[product.id] ?? ''}
                selected={selected === product.id}
                onSelect={() => setSelected(product.id)}
              />
            ))}
          </View>

          {/* CTA */}
          {!isPremium && (
            <TouchableOpacity
              style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
              onPress={handlePurchase}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textInverse} size="small" />
              ) : (
                <Text style={styles.ctaBtnText}>
                  Comprar {PRODUCTS.find(p => p.id === selected)?.title ?? ''}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* Legal */}
          <Text style={styles.legalText}>
            {selected === 'jyotish_monthly'
              ? 'Se renueva automáticamente cada mes. Cancela cuando quieras.'
              : 'Compra única. Los créditos no expiran.'}
          </Text>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({ product, icon, desc, selected, onSelect }: {
  product: PurchaseProduct;
  icon: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const isBest = product.id === 'jyotish_bundle_10';

  return (
    <TouchableOpacity
      style={[styles.planCard, selected && styles.planCardActive]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {isBest && (
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>Mejor valor</Text>
        </View>
      )}

      <View style={styles.planRow}>
        <Text style={[styles.planIcon, selected && styles.planIconActive]}>{icon}</Text>
        <View style={styles.planInfo}>
          <Text style={[styles.planTitle, selected && styles.planTitleActive]}>
            {product.title}
          </Text>
          <Text style={styles.planDesc}>{desc}</Text>
        </View>
        <Text style={[styles.planPrice, selected && styles.planPriceActive]}>
          {product.price}
        </Text>
      </View>

      {product.id === 'jyotish_bundle_10' && (
        <View style={styles.saveBadge}>
          <Text style={styles.saveText}>$0.70/lectura — 30% ahorro</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  nav: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'flex-end',
  },
  navClose: { fontSize: 20, color: COLORS.textMuted, padding: SPACING.sm },
  content: { padding: SPACING.xl, gap: SPACING.xl },
  // ── Hero
  hero: { alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md },
  heroSymbol: {
    fontSize: 48,
    color: COLORS.gold,
    textShadowColor: COLORS.gold + '50',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.goldLight,
    letterSpacing: 2,
  },
  heroSub: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // ── Credits badge
  creditsBadge: {
    backgroundColor: COLORS.gold + '18',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
    padding: SPACING.md,
    alignItems: 'center',
  },
  creditsText: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  premiumBadge: {
    backgroundColor: COLORS.success + '18',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
    padding: SPACING.md,
    alignItems: 'center',
  },
  premiumBadgeText: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  // ── Plans
  plansCol: { gap: SPACING.md },
  planCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.sm,
    position: 'relative',
    overflow: 'visible',
  },
  planCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim + '15',
    ...SHADOWS.gold,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.lg,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  planBadgeText: {
    fontFamily: FONTS.display,
    fontSize: 9,
    letterSpacing: 1,
    color: COLORS.textInverse,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  planIcon: { fontSize: 28, color: COLORS.textMuted },
  planIconActive: { color: COLORS.gold },
  planInfo: { flex: 1, gap: 2 },
  planTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
  },
  planTitleActive: { color: COLORS.goldLight },
  planDesc: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  planPrice: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
  },
  planPriceActive: { color: COLORS.goldLight },
  saveBadge: {
    backgroundColor: COLORS.success + '15',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginLeft: 44,
  },
  saveText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.success,
    letterSpacing: 0.3,
  },
  // ── CTA
  ctaBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.gold,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnText: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.md,
    color: COLORS.textInverse,
    letterSpacing: 1.5,
  },
  // ── Legal
  legalText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
