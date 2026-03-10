// ─────────────────────────────────────────────────────────────────────────────
// ROOT LAYOUT — app/_layout.tsx
// Carga fuentes, inicializa sesión, configura stack raíz.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Cinzel_400Regular,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
} from '@expo-google-fonts/lato';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../src/constants/design';

// Mantener splash visible hasta que carguen las fuentes
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bgDeep },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(auth)"  options={{ animation: 'none' }} />
      <Stack.Screen name="(app)"   options={{ animation: 'none' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
});
