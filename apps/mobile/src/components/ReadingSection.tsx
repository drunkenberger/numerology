// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — ReadingSection
// Sección expandible para mostrar una parte de la lectura numerológica.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS,
} from '../constants/design';

interface Props {
  icon:    string;
  title:   string;
  content: string;
}

export function ReadingSection({ icon, title, content }: Props) {
  const [expanded, setExpanded] = useState(false);
  const preview = content.split('\n')[0] ?? content;
  const hasMore = content.length > preview.length + 5;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.chevron}>{expanded ? '∧' : '∨'}</Text>
      </TouchableOpacity>

      {(expanded || !hasMore) ? (
        <View style={styles.body}>
          {content.split(/\n\n|\n/).filter(Boolean).map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p.trim()}</Text>
          ))}
        </View>
      ) : (
        <TouchableOpacity onPress={() => setExpanded(true)} activeOpacity={0.7}>
          <Text style={styles.preview} numberOfLines={2}>{preview}</Text>
          <Text style={styles.readMore}>Leer más ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgSection,
    borderWidth: 1,
    borderColor: COLORS.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
    color: COLORS.gold,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: COLORS.gold,
  },
  chevron: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  body: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  paragraph: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  preview: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  readMore: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
});
