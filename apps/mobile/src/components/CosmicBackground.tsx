// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — CosmicBackground
// Fondo cosmos: gradiente profundo + campo de estrellas SVG
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { COLORS } from '../constants/design';

// Genera estrellas pseudo-aleatorias deterministas por seed
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateStars(count: number, w: number, h: number) {
  const rand = seededRandom(42);
  return Array.from({ length: count }, (_, i) => ({
    key:     i,
    cx:      rand() * w,
    cy:      rand() * h,
    r:       rand() * 1.5 + 0.3,
    opacity: rand() * 0.6 + 0.15,
  }));
}

interface CosmicBackgroundProps {
  children?: React.ReactNode;
  intensity?: 'dim' | 'normal' | 'bright';
}

export function CosmicBackground({ children, intensity = 'normal' }: CosmicBackgroundProps) {
  const { width: W, height: H } = useWindowDimensions();
  const stars = useMemo(() => generateStars(180, W, H), [W, H]);
  const starColor = intensity === 'bright' ? '#ffffff' : '#e8d8c8';

  return (
    <View style={styles.container}>
      {/* SVG background */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg width={W} height={H} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <RadialGradient id="cosmos" cx="50%" cy="30%" r="80%">
              <Stop offset="0%"   stopColor="#1a1440" stopOpacity="1" />
              <Stop offset="40%"  stopColor="#0f0f24" stopOpacity="1" />
              <Stop offset="100%" stopColor="#080812" stopOpacity="1" />
            </RadialGradient>
            <RadialGradient id="glow" cx="50%" cy="20%" r="40%">
              <Stop offset="0%"   stopColor={COLORS.gold} stopOpacity="0.06" />
              <Stop offset="100%" stopColor={COLORS.gold} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width={W} height={H} fill="url(#cosmos)" />
          <Rect width={W} height={H} fill="url(#glow)" />
          {stars.map(s => (
            <Circle
              key={s.key}
              cx={s.cx} cy={s.cy} r={s.r}
              fill={starColor}
              opacity={s.opacity}
            />
          ))}
        </Svg>
      </View>

      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
});
