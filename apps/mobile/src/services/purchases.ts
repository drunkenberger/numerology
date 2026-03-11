// ─────────────────────────────────────────────────────────────────────────────
// SERVICE — Purchases (RevenueCat wrapper)
// En dev mode usa mock. En producción usa react-native-purchases.
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PurchaseProduct {
  id: string;
  title: string;
  price: string;
  priceAmount: number;
  credits: number;
  type: 'consumable' | 'subscription';
}

export const PRODUCTS: PurchaseProduct[] = [
  {
    id:          'jyotish_single_reading',
    title:       '1 Lectura',
    price:       '$1.00',
    priceAmount: 1.00,
    credits:     1,
    type:        'consumable',
  },
  {
    id:          'jyotish_bundle_10',
    title:       '10 Lecturas',
    price:       '$7.00',
    priceAmount: 7.00,
    credits:     10,
    type:        'consumable',
  },
  {
    id:          'jyotish_monthly',
    title:       'Premium Mensual',
    price:       '$10.00/mes',
    priceAmount: 10.00,
    credits:     -1, // unlimited
    type:        'subscription',
  },
];

// ── RevenueCat configuration ─────────────────────────────────────────────────

let isConfigured = false;

export async function configurePurchases(userId: string): Promise<void> {
  if (__DEV__ || isConfigured) return;

  try {
    const Purchases = require('react-native-purchases').default;
    const apiKey = Platform.OS === 'ios'
      ? Constants.expoConfig?.extra?.revenueCatIos
      : Constants.expoConfig?.extra?.revenueCatAndroid;

    if (!apiKey) {
      console.warn('[purchases] No RevenueCat API key configured');
      return;
    }

    await Purchases.configure({ apiKey, appUserID: userId });
    isConfigured = true;
    console.log('[purchases] RevenueCat configured for user:', userId);
  } catch (err) {
    console.warn('[purchases] Failed to configure RevenueCat:', err);
  }
}

// ── Purchase flow ────────────────────────────────────────────────────────────

export async function purchaseProduct(productId: string): Promise<boolean> {
  if (__DEV__) {
    console.log('[purchases] DEV: mock purchase for', productId);
    // En dev, simular compra exitosa
    return true;
  }

  try {
    const Purchases = require('react-native-purchases').default;
    const { customerInfo } = await Purchases.purchaseProduct(productId);
    console.log('[purchases] Purchase successful:', productId);
    return true;
  } catch (err: any) {
    if (err.userCancelled) {
      console.log('[purchases] User cancelled purchase');
      return false;
    }
    console.error('[purchases] Purchase error:', err);
    throw err;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (__DEV__) return false;

  try {
    const Purchases = require('react-native-purchases').default;
    const customerInfo = await Purchases.restorePurchases();
    const hasActive = Object.keys(customerInfo.entitlements.active).length > 0;
    return hasActive;
  } catch (err) {
    console.error('[purchases] Restore error:', err);
    return false;
  }
}
