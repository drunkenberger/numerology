// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — History
// Lista de lecturas pasadas con filtros por tipo.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { ReadingHistoryCard } from '../../src/components/ReadingHistoryCard';
import { useStore, useReadingHistory } from '../../src/stores/app.store';
import { api } from '../../src/services/api';
import type { ReadingType, ReadingListItem } from '../../src/services/api';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS,
} from '../../src/constants/design';

type FilterType = 'all' | ReadingType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',           label: 'Todas' },
  { key: 'personal',      label: 'Personal' },
  { key: 'compatibility', label: 'Compatibilidad' },
  { key: 'family',        label: 'Familiar' },
];

export default function HistoryScreen() {
  const history = useReadingHistory();
  const [filter, setFilter]   = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const items = await api.listReadings();
      useStore.getState().setReadingHistory(items);
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchHistory(); }, [fetchHistory]);

  const filtered = filter === 'all'
    ? history
    : history.filter(r => r.type === filter);

  function handlePress(item: ReadingListItem) {
    router.push({
      pathname: `/reading/${item.id}`,
      params: {
        readingId:   item.id,
        type:        item.type,
        memberNames: item.memberNames.join(item.type === 'compatibility' ? ' y ' : ', '),
      },
    } as any);
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
          <Text style={styles.headerTitle}>Historial</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.gold} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>◎</Text>
            <Text style={styles.emptyTitle}>Sin lecturas aún</Text>
            <Text style={styles.emptyBody}>
              Las lecturas que generes aparecerán aquí.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ReadingHistoryCard item={item} onPress={() => handlePress(item)} />
            )}
          />
        )}
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    borderColor: COLORS.goldDim,
    backgroundColor: COLORS.goldDim + '30',
  },
  filterLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  filterLabelActive: { color: COLORS.gold },
  list: { padding: SPACING.xl, gap: SPACING.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  emptyIcon: { fontSize: 48, color: COLORS.textMuted },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  emptyBody: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
