// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — ReadingExportButtons
// Botones de exportación: HTML y PDF desde el HTML local renderizado.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS,
} from '../constants/design';
import { shareHtml, sharePdf } from '../utils/download';

interface Props {
  html: string | null;
  filename: string;
}

type ButtonKey = 'html' | 'pdf';

export function ReadingExportButtons({ html, filename }: Props) {
  const [busy, setBusy] = useState<Record<ButtonKey, boolean>>({
    html: false, pdf: false,
  });

  const available = !!html;

  async function handleExport(key: ButtonKey) {
    if (!html) return;
    setBusy(prev => ({ ...prev, [key]: true }));
    try {
      if (key === 'html') await shareHtml(html, filename);
      if (key === 'pdf')  await sharePdf(html, filename);
    } catch {
      Alert.alert('Error', 'No se pudo exportar. Intenta de nuevo.');
    } finally {
      setBusy(prev => ({ ...prev, [key]: false }));
    }
  }

  const buttons: { key: ButtonKey; icon: string; label: string }[] = [
    { key: 'html', icon: '◈', label: 'Compartir HTML' },
    { key: 'pdf',  icon: '⬡', label: 'Compartir PDF' },
  ];

  return (
    <View style={styles.container}>
      {buttons.map(btn => {
        const loading = busy[btn.key];
        const disabled = !available || loading;
        return (
          <TouchableOpacity
            key={btn.key}
            style={[styles.button, !available && styles.disabled]}
            onPress={() => handleExport(btn.key)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <Text style={styles.icon}>{btn.icon}</Text>
            )}
            <Text style={[styles.label, !available && styles.labelDim]}>
              {available ? btn.label : 'Lectura no disponible'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.md },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
    backgroundColor: COLORS.bgCard,
  },
  disabled: { opacity: 0.4 },
  icon: { fontSize: 18, color: COLORS.gold },
  label: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    letterSpacing: 1,
  },
  labelDim: { color: COLORS.textMuted },
});
